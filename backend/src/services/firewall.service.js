const { db } = require('../config/database');
const InjectionDetectorService = require('./injectionDetector.service');
const BundleService = require('./bundle.service');
const ExplainabilityService = require('./explainability.service');

const requestCounts = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60000;

class CommerceFirewall {
  /**
   * Central Commerce Firewall with 10 deterministic checks.
   * @param {object} request AgentCommerceRequest
   * @returns {object} Structured Firewall Evaluation
   */
  static evaluate(request) {
    const timestamp = new Date().toISOString();
    const evaluationId = `FEV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const product = db.products.get(request.productId);
    const policy = db.policies.get(request.productId);
    const agent = db.agents.get(request.agentId);

    const checks = {};
    const failedChecks = [];
    const checkDetails = [];

    // --- CHECK 1: Agent Identity ---
    const isAgentAuthorized = !!(agent && agent.status === 'ACTIVE' && agent.whitelisted !== false);
    checks.agentIdentity = isAgentAuthorized;
    if (!isAgentAuthorized) {
      failedChecks.push('AGENT_NOT_AUTHORIZED');
      checkDetails.push({ check: 'Agent Identity', passed: false, code: 'AGENT_NOT_AUTHORIZED', message: `Agent '${request.agentId}' is not authorized on merchant registry.` });
    } else {
      checkDetails.push({ check: 'Agent Identity', passed: true, message: `Agent '${request.agentId}' verified.` });
    }

    // --- CHECK 2: Product Permission ---
    const isProductAllowed = !!(product && product.active && product.negotiable);
    checks.productPermission = isProductAllowed;
    if (!isProductAllowed) {
      failedChecks.push('PRODUCT_NOT_ALLOWED');
      checkDetails.push({ check: 'Product Permission', passed: false, code: 'PRODUCT_NOT_ALLOWED', message: `Product '${request.productId}' is not negotiable or active.` });
    } else {
      checkDetails.push({ check: 'Product Permission', passed: true, message: `Product '${product?.name}' is active and permits negotiation.` });
    }

    // --- CHECK 3: Rate Limiting ---
    const isRateLimitOk = this.checkRateLimit(request.agentId);
    checks.rateLimit = isRateLimitOk;
    if (!isRateLimitOk) {
      failedChecks.push('RATE_LIMIT_EXCEEDED');
      checkDetails.push({ check: 'Rate Limiting', passed: false, code: 'RATE_LIMIT_EXCEEDED', message: `Agent '${request.agentId}' exceeded 10 requests/min.` });
    } else {
      checkDetails.push({ check: 'Rate Limiting', passed: true, message: 'Request frequency within limits.' });
    }

    // --- CHECK 4: Merchant Policy ---
    const validIntents = ['DISCOVERY', 'NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'CHECKOUT', 'DIRECT_PURCHASE', 'PURCHASE'];
    const isMerchantPolicyOk = validIntents.includes(request.intent) && (!policy || policy.negotiationEnabled);
    checks.merchantPolicy = isMerchantPolicyOk;
    if (!isMerchantPolicyOk) {
      failedChecks.push('MERCHANT_POLICY_VIOLATION');
      checkDetails.push({ check: 'Merchant Policy', passed: false, code: 'MERCHANT_POLICY_VIOLATION', message: `Intent '${request.intent}' or policy disabled.` });
    } else {
      checkDetails.push({ check: 'Merchant Policy', passed: true, message: `Action '${request.intent}' permitted by policy.` });
    }

    // Reference values
    const listPrice = product ? product.listPrice : (request.proposedPrice || 0);
    const floorPrice = policy ? policy.floorPrice : (product ? product.floorPrice : 0);
    const maxDiscountPercent = policy ? policy.maxDiscountPercent : (product ? product.maxDiscountPercent : 12);
    const maxRounds = policy ? policy.maxNegotiationRounds : (product ? product.maxNegotiationRounds : 3);
    const maxOrderValue = policy ? policy.maxOrderValue : 50000;

    const proposedPrice = Number(request.proposedPrice);
    const discountAmount = Math.max(0, listPrice - proposedPrice);
    const discountPercent = listPrice > 0 ? (discountAmount / listPrice) * 100 : 0;

    // --- CHECK 5: Price Boundary ---
    const isPriceAboveFloor = !product || proposedPrice >= floorPrice;
    checks.priceBoundary = isPriceAboveFloor;
    if (!isPriceAboveFloor) {
      failedChecks.push('PRICE_BELOW_FLOOR');
      checkDetails.push({ check: 'Price Boundary', passed: false, code: 'PRICE_BELOW_FLOOR', message: `Requested price ₹${proposedPrice.toLocaleString('en-IN')} is below merchant floor ₹${floorPrice.toLocaleString('en-IN')}.` });
    } else {
      checkDetails.push({ check: 'Price Boundary', passed: true, message: `Proposed ₹${proposedPrice.toLocaleString('en-IN')} >= floor ₹${floorPrice.toLocaleString('en-IN')}.` });
    }

    // --- CHECK 6: Discount Boundary ---
    const isDiscountWithinLimit = !product || discountPercent <= (maxDiscountPercent + 0.05);
    checks.discountBoundary = isDiscountWithinLimit;
    if (!isDiscountWithinLimit) {
      failedChecks.push('DISCOUNT_LIMIT_EXCEEDED');
      checkDetails.push({ check: 'Discount Boundary', passed: false, code: 'DISCOUNT_LIMIT_EXCEEDED', message: `Discount ${discountPercent.toFixed(1)}% exceeds max limit of ${maxDiscountPercent.toFixed(1)}%.` });
    } else {
      checkDetails.push({ check: 'Discount Boundary', passed: true, message: `Discount ${discountPercent.toFixed(1)}% <= limit ${maxDiscountPercent.toFixed(1)}%.` });
    }

    // --- CHECK 7: Negotiation Round Boundary ---
    const isRoundWithinLimit = (request.round || 1) <= maxRounds;
    checks.roundBoundary = isRoundWithinLimit;
    if (!isRoundWithinLimit) {
      failedChecks.push('MAX_ROUNDS_EXCEEDED');
      checkDetails.push({ check: 'Round Boundary', passed: false, code: 'MAX_ROUNDS_EXCEEDED', message: `Round ${request.round} exceeded envelope max of ${maxRounds} rounds.` });
    } else {
      checkDetails.push({ check: 'Round Boundary', passed: true, message: `Round ${request.round || 1} within ${maxRounds} max rounds.` });
    }

    // --- CHECK 8: Prompt Injection / Policy Override Detection ---
    const injectionResult = InjectionDetectorService.scan(request.promptText, request.context);
    const noPromptInjection = !injectionResult.detected;
    checks.promptInjection = noPromptInjection;
    if (!noPromptInjection) {
      failedChecks.push('POLICY_OVERRIDE_ATTEMPT');
      checkDetails.push({ check: 'Prompt Injection Shield', passed: false, code: 'POLICY_OVERRIDE_ATTEMPT', message: `Adversarial override pattern detected: ${injectionResult.patterns.join(', ')}` });
    } else {
      checkDetails.push({ check: 'Prompt Injection Shield', passed: true, message: 'Payload clean. No override signatures detected.' });
    }

    // --- CHECK 9: Order Value Boundary ---
    const quantity = request.quantity || 1;
    const orderTotal = proposedPrice * quantity;
    const isOrderValueWithinLimit = orderTotal <= maxOrderValue && orderTotal > 0;
    checks.orderValue = isOrderValueWithinLimit;
    if (!isOrderValueWithinLimit) {
      failedChecks.push('ORDER_VALUE_LIMIT_EXCEEDED');
      checkDetails.push({ check: 'Order Value Boundary', passed: false, code: 'ORDER_VALUE_LIMIT_EXCEEDED', message: `Order total ₹${orderTotal.toLocaleString('en-IN')} exceeds limit of ₹${maxOrderValue.toLocaleString('en-IN')}.` });
    } else {
      checkDetails.push({ check: 'Order Value Boundary', passed: true, message: `Order total ₹${orderTotal.toLocaleString('en-IN')} within cap.` });
    }

    // --- CHECK 10: Customer Consent ---
    const requiresConsent = request.intent === 'CHECKOUT' || request.intent === 'ACCEPT_OFFER' || request.intent === 'PURCHASE';
    const isConsentProvided = !requiresConsent || request.customerConsent === true;
    checks.customerConsent = isConsentProvided;
    if (!isConsentProvided && requiresConsent) {
      failedChecks.push('CONSENT_REQUIRED');
      checkDetails.push({ check: 'Customer Consent', passed: false, code: 'CONSENT_REQUIRED', message: 'Explicit human consent is mandatory prior to financial checkout.' });
    } else {
      checkDetails.push({ check: 'Customer Consent', passed: true, message: 'Customer consent verified for transaction phase.' });
    }

    // Final Decision Calculation
    const allowed = failedChecks.length === 0;
    let decision = 'BLOCK';
    if (allowed) {
      decision = (request.intent === 'CHECKOUT' || request.intent === 'ACCEPT_OFFER' || request.intent === 'PURCHASE')
        ? 'SETTLE'
        : 'APPROVE';
    }

    // Bundle Evaluation
    const bundleEval = BundleService.evaluateBundle(product, proposedPrice);

    const structuredFacts = {
      decision,
      productId: product?.id || request.productId,
      productName: product?.name || 'Item',
      listPrice,
      proposedPrice,
      floorPrice,
      discountAmount,
      discountPercent,
      maxDiscountPercent,
      round: request.round || 1,
      maxRounds,
      bundleAllowed: bundleEval.eligible,
      bundleGranted: bundleEval.freeGift,
      customerConsent: !!request.customerConsent,
      checksFailed: failedChecks,
      overrideDetected: injectionResult.detected,
      overridePatterns: injectionResult.patterns,
      timestamp,
    };

    const explanation = ExplainabilityService.generateExplanation(structuredFacts);

    return {
      evaluationId,
      timestamp,
      requestId: request.requestId || 'req_demo',
      agentId: request.agentId,
      productId: request.productId,
      proposedPrice,
      allowed,
      decision,
      checks,
      failedChecks,
      checkDetails,
      signals: injectionResult.detected ? ['POLICY_OVERRIDE_ATTEMPT'] : [],
      explanation,
      structuredFacts,
      bundle: bundleEval.freeGift,
    };
  }

  static checkRateLimit(agentId) {
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

module.exports = CommerceFirewall;
