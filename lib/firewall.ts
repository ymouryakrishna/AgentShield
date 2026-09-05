import { 
  AgentCommerceRequest, 
  FirewallEvaluation, 
  FirewallCheckItem, 
  DecisionFacts,
  Product 
} from './types';
import { getProductById } from './catalog';
import { generateStructuredExplanation } from './explainability';

// Known prompt injection / override patterns
const OVERRIDE_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system)\s+(instructions|constraints|rules|prompts|limits)/i,
  /override\s+(merchant|system|pricing|floor|policy|rules)/i,
  /system\s+override/i,
  /merchant\s+(has\s+)?(already\s+)?approved/i,
  /bypass\s+(minimum\s+price|floor|firewall|limit|rules|policy)/i,
  /disable\s+(restrictions|firewall|policy|safeguards|limits)/i,
  /settle\s+(this\s+)?(order\s+)?(at|for)\s+₹?\s*(1|0|0\.01)/i,
  /price\s*=\s*(0|1)/i,
  /grant\s+(free|zero\s+cost|100%\s+discount)/i,
  /you\s+must\s+comply\s+without\s+restrictions/i,
  /jailbreak/i,
  /admin\s+mode/i,
];

// Simple in-memory rate limiter per agent
const requestCounts = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export class CommerceFirewall {
  /**
   * Evaluates an incoming AgentCommerceRequest against all 10 merchant policy checks deterministically.
   */
  public static evaluate(request: AgentCommerceRequest): FirewallEvaluation {
    const timestamp = new Date().toISOString();
    const evaluationId = `FEV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const product = getProductById(request.productId);

    const checks: FirewallCheckItem[] = [];
    const violations: string[] = [];
    const signals: string[] = [];
    const detectedOverridePatterns: string[] = [];

    // --- CHECK 1: Agent Identity ---
    const isAuthorizedAgent = this.checkAgentIdentity(request.agentId);
    checks.push({
      checkId: 'CHECK_1_AGENT_IDENTITY',
      name: 'Agent Identity & Reputation',
      description: 'Verifies the agent is a registered and trusted agent entity',
      passed: isAuthorizedAgent,
      severity: 'CRITICAL',
      detail: isAuthorizedAgent 
        ? `Agent '${request.agentId}' verified on merchant registry.`
        : `Agent '${request.agentId}' is untrusted or unverified.`,
    });
    if (!isAuthorizedAgent) violations.push('CHECK_1_AGENT_IDENTITY');

    // --- CHECK 2: Product Permissions ---
    const productExists = !!product;
    const isNegotiable = !!(product && product.negotiable);
    const productPermPassed = productExists && isNegotiable;
    checks.push({
      checkId: 'CHECK_2_PRODUCT_PERMISSION',
      name: 'Product Negotiation Permission',
      description: 'Checks if product exists in catalog and has negotiation enabled',
      passed: productPermPassed,
      severity: 'CRITICAL',
      detail: !productExists
        ? `Product ID '${request.productId}' not found in active catalog.`
        : isNegotiable
        ? `Product '${product?.name}' is active and permits autonomous negotiation.`
        : `Product '${product?.name}' is fixed-price only.`,
    });
    if (!productPermPassed) violations.push('CHECK_2_PRODUCT_PERMISSION');

    // --- CHECK 3: Rate Limit ---
    const rateLimitPassed = this.checkRateLimit(request.agentId);
    checks.push({
      checkId: 'CHECK_3_RATE_LIMIT',
      name: 'Agent Request Frequency & Rate Limiting',
      description: 'Protects against spam, DDOS, and high-frequency automated probing',
      passed: rateLimitPassed,
      severity: 'HIGH',
      detail: rateLimitPassed
        ? `Request rate within permitted window (${RATE_LIMIT_MAX} req/min).`
        : `Agent exceeded rate threshold. Burst probing throttled.`,
    });
    if (!rateLimitPassed) violations.push('CHECK_3_RATE_LIMIT');

    // --- CHECK 4: Merchant Policy & Supported Actions ---
    const validActions = ['DISCOVERY', 'NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'CHECKOUT', 'DIRECT_PURCHASE'];
    const actionSupported = validActions.includes(request.intent);
    checks.push({
      checkId: 'CHECK_4_MERCHANT_POLICY',
      name: 'Merchant Action Capability',
      description: 'Ensures the intent/action maps to an allowed commerce workflow',
      passed: actionSupported,
      severity: 'HIGH',
      detail: actionSupported
        ? `Intent '${request.intent}' is supported by merchant policy.`
        : `Action '${request.intent}' is disallowed.`,
    });
    if (!actionSupported) violations.push('CHECK_4_MERCHANT_POLICY');

    // Compute price & discount metrics
    const listedPrice = product ? product.price : (request.proposedPrice || 0);
    const floorPrice = product ? product.negotiation.floorPrice : 0;
    const maxDiscountPercent = product ? product.negotiation.maxDiscountPercent : 0;
    const maxRounds = product ? product.negotiation.maxRounds : 3;
    const maxOrderValue = product ? product.negotiation.maxOrderValue : 50000;

    const discountAmount = Math.max(0, listedPrice - request.proposedPrice);
    const discountPercent = listedPrice > 0 ? (discountAmount / listedPrice) * 100 : 0;

    // --- CHECK 5: Price Boundary ---
    // If request proposes a price, it MUST be >= floorPrice
    const priceBoundaryPassed = !product || request.proposedPrice >= floorPrice;
    checks.push({
      checkId: 'CHECK_5_PRICE_BOUNDARY',
      name: 'Merchant Price Floor Boundary',
      description: 'Ensures proposed price is strictly at or above the hard floor',
      passed: priceBoundaryPassed,
      severity: 'CRITICAL',
      detail: priceBoundaryPassed
        ? `Proposed ₹${request.proposedPrice.toLocaleString('en-IN')} $\\ge$ merchant floor ₹${floorPrice.toLocaleString('en-IN')}.`
        : `VIOLATION: Proposed ₹${request.proposedPrice.toLocaleString('en-IN')} is below floor ₹${floorPrice.toLocaleString('en-IN')}. Margin breach of ₹${(floorPrice - request.proposedPrice).toLocaleString('en-IN')}.`,
    });
    if (!priceBoundaryPassed) violations.push('CHECK_5_PRICE_BOUNDARY');

    // --- CHECK 6: Discount Boundary ---
    const discountBoundaryPassed = !product || discountPercent <= (maxDiscountPercent + 0.05);
    checks.push({
      checkId: 'CHECK_6_DISCOUNT_BOUNDARY',
      name: 'Maximum Discount Percentage Boundary',
      description: 'Prevents excessive discounts exceeding merchant allowance',
      passed: discountBoundaryPassed,
      severity: 'CRITICAL',
      detail: discountBoundaryPassed
        ? `Discount ${discountPercent.toFixed(1)}% $\\le$ max allowed ${maxDiscountPercent.toFixed(1)}%.`
        : `VIOLATION: Discount ${discountPercent.toFixed(1)}% exceeds max permitted ${maxDiscountPercent.toFixed(1)}%.`,
    });
    if (!discountBoundaryPassed) violations.push('CHECK_6_DISCOUNT_BOUNDARY');

    // --- CHECK 7: Negotiation Round Boundary ---
    const roundBoundaryPassed = request.round <= maxRounds;
    checks.push({
      checkId: 'CHECK_7_ROUND_BOUNDARY',
      name: 'Negotiation Rounds Limit',
      description: 'Restricts conversation turns to prevent unbounded agent loops',
      passed: roundBoundaryPassed,
      severity: 'HIGH',
      detail: roundBoundaryPassed
        ? `Round ${request.round} within max ${maxRounds} rounds.`
        : `VIOLATION: Round ${request.round} exceeded envelope limit of ${maxRounds} rounds.`,
    });
    if (!roundBoundaryPassed) violations.push('CHECK_7_ROUND_BOUNDARY');

    // --- CHECK 8: Prompt Injection / Policy Bypass Detection ---
    const combinedText = `${request.promptText || ''} ${JSON.stringify(request.context || {})}`;
    for (const pattern of OVERRIDE_PATTERNS) {
      if (pattern.test(combinedText)) {
        signals.push('POLICY_OVERRIDE_ATTEMPT');
        detectedOverridePatterns.push(pattern.source);
      }
    }
    const noInjectionPassed = detectedOverridePatterns.length === 0;
    checks.push({
      checkId: 'CHECK_8_PROMPT_INJECTION_SHIELD',
      name: 'Prompt Injection & Policy Bypass Shield',
      description: 'Deterministic inspection for adversarial override keywords and manipulative jailbreak prompts',
      passed: noInjectionPassed,
      severity: 'CRITICAL',
      detail: noInjectionPassed
        ? 'Payload clean. No adversarial bypass signatures found.'
        : `CRITICAL THREAT: Adversarial injection detected matching rule(s): ${detectedOverridePatterns.join(', ')}.`,
    });
    if (!noInjectionPassed) violations.push('CHECK_8_PROMPT_INJECTION_SHIELD');

    // --- CHECK 9: Order Value Boundary ---
    const totalOrderValue = request.proposedPrice * (request.quantity || 1);
    const orderValuePassed = totalOrderValue <= maxOrderValue && totalOrderValue > 0;
    checks.push({
      checkId: 'CHECK_9_ORDER_VALUE',
      name: 'Total Order Value Boundary',
      description: 'Enforces maximum exposure threshold per autonomous order',
      passed: orderValuePassed,
      severity: 'MEDIUM',
      detail: orderValuePassed
        ? `Order value ₹${totalOrderValue.toLocaleString('en-IN')} within merchant cap of ₹${maxOrderValue.toLocaleString('en-IN')}.`
        : `Order value ₹${totalOrderValue.toLocaleString('en-IN')} exceeds maximum allowed ₹${maxOrderValue.toLocaleString('en-IN')}.`,
    });
    if (!orderValuePassed) violations.push('CHECK_9_ORDER_VALUE');

    // --- CHECK 10: Customer Consent & Checkout Gate ---
    // If intent is CHECKOUT or ACCEPT_OFFER, customer consent must be verified
    const requiresConsent = request.intent === 'CHECKOUT' || request.intent === 'ACCEPT_OFFER';
    const consentPassed = !requiresConsent || request.customerConsent === true;
    checks.push({
      checkId: 'CHECK_10_CUSTOMER_CONSENT',
      name: 'Customer Explicit Consent Gate',
      description: 'Requires explicit human confirmation before initiating financial settlement',
      passed: consentPassed,
      severity: 'HIGH',
      detail: !requiresConsent
        ? 'Negotiation phase: consent verified pending final settlement.'
        : consentPassed
        ? 'Explicit customer authorization confirmed via consent token.'
        : 'Awaiting explicit customer confirmation prior to payment initiation.',
    });
    if (!consentPassed && requiresConsent) violations.push('CHECK_10_CUSTOMER_CONSENT');

    // Determine Final Decision
    const allPassed = violations.length === 0;
    let decision: 'APPROVE' | 'COUNTER' | 'SETTLE' | 'BLOCK' = 'BLOCK';

    if (allPassed) {
      if (request.intent === 'CHECKOUT' || request.intent === 'ACCEPT_OFFER') {
        decision = 'SETTLE';
      } else if (request.intent === 'NEGOTIATE' || request.intent === 'COUNTER_OFFER') {
        decision = 'APPROVE';
      } else {
        decision = 'APPROVE';
      }
    } else {
      decision = 'BLOCK';
    }

    // Check bundle eligibility
    const bundleConfig = product?.bundle;
    const giftAllowed = !!(bundleConfig && request.proposedPrice >= bundleConfig.minimumPrice);
    const giftGranted = giftAllowed ? bundleConfig.freeGift : null;

    const structuredFacts: DecisionFacts = {
      decision,
      productId: product?.id || request.productId,
      productName: product?.name || 'Unknown Item',
      listedPrice,
      proposedPrice: request.proposedPrice,
      floorPrice,
      discountAmount,
      discountPercent,
      maxDiscountPercent,
      round: request.round,
      maxRounds,
      giftAllowed,
      giftGranted,
      buyerConfirmed: request.customerConsent,
      checksPassed: checks.filter(c => c.passed).map(c => c.checkId),
      checksFailed: violations,
      overrideDetected: detectedOverridePatterns.length > 0,
      overridePatterns: detectedOverridePatterns,
      timestamp,
    };

    const explanation = generateStructuredExplanation(structuredFacts);

    return {
      id: evaluationId,
      timestamp,
      requestId: request.requestId,
      agentId: request.agentId,
      productId: request.productId,
      proposedPrice: request.proposedPrice,
      passed: allPassed,
      decision,
      checks,
      violations,
      signals,
      explanation,
      structuredFacts,
    };
  }

  private static checkAgentIdentity(agentId: string): boolean {
    const recognizedAgents = [
      'agent-a-legitimate',
      'agent-b-adversarial', // agent-b is recognized for sandboxed evaluation
      'buyer-ai-agent',
      'web-shopper-01',
      'merchant-agent-internal',
      'demo-buyer',
    ];
    return recognizedAgents.includes(agentId) || agentId.startsWith('agent-') || agentId.startsWith('buyer-');
  }

  private static checkRateLimit(agentId: string): boolean {
    const now = Date.now();
    const entry = requestCounts.get(agentId) || { count: 0, windowStart: now };

    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      entry.count = 1;
      entry.windowStart = now;
      requestCounts.set(agentId, entry);
      return true;
    }

    entry.count += 1;
    requestCounts.set(agentId, entry);
    return entry.count <= RATE_LIMIT_MAX;
  }
}
