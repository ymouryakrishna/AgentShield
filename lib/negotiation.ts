import { 
  Product, 
  NegotiationSession, 
  NegotiationOffer, 
  AgentCommerceRequest, 
  FirewallEvaluation,
  DecisionFacts 
} from './types';
import { getProductById } from './catalog';
import { CommerceFirewall } from './firewall';
import { generateStructuredExplanation } from './explainability';

export interface ProcessOfferResult {
  session: NegotiationSession;
  firewallEvaluation: FirewallEvaluation;
  status: 'ACCEPTED' | 'COUNTERED' | 'BLOCKED' | 'SETTLED';
  message: string;
  suggestedAction?: 'CONTINUE' | 'PROCEED_TO_PAYMENT' | 'ABORT' | 'RETRY_SAFE';
  policyFacts: DecisionFacts;
}

export class BoundedNegotiationEngine {
  /**
   * Initializes a new negotiation session for a product and buyer agent.
   */
  public static createSession(product: Product, buyerAgentId: string, buyerAgentName?: string): NegotiationSession {
    const now = new Date().toISOString();
    const sessionId = `NGS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return {
      id: sessionId,
      productId: product.id,
      product,
      buyerAgentId,
      buyerAgentName: buyerAgentName || (buyerAgentId === 'agent-b-adversarial' ? 'Agent B (Adversarial Prober)' : 'Agent A (Smart Shopper AI)'),
      status: 'ACTIVE',
      currentRound: 0,
      maxRounds: product.negotiation.maxRounds,
      listedPrice: product.price,
      floorPrice: product.negotiation.floorPrice,
      buyerConfirmed: false,
      offers: [],
      firewallEvaluations: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Processes an incoming offer or intent from the buyer agent.
   * STRICT RULE: The policy engine authorizes the action deterministically.
   */
  public static processBuyerOffer(
    session: NegotiationSession, 
    buyerProposedPrice: number, 
    promptText: string,
    customerConsent: boolean = false,
    intent: 'NEGOTIATE' | 'COUNTER_OFFER' | 'ACCEPT_OFFER' | 'CHECKOUT' = 'NEGOTIATE'
  ): ProcessOfferResult {
    const nextRound = session.currentRound + 1;
    const now = new Date().toISOString();

    const commerceRequest: AgentCommerceRequest = {
      requestId: `REQ-${Date.now().toString(36).toUpperCase()}`,
      agentId: session.buyerAgentId,
      agentName: session.buyerAgentName,
      intent,
      productId: session.productId,
      proposedPrice: buyerProposedPrice,
      quantity: 1,
      round: nextRound,
      promptText,
      customerConsent,
      context: {
        sessionId: session.id,
        previousOffers: session.offers.map(o => ({ actor: o.actor, price: o.proposedPrice, round: o.round })),
        timestamp: now,
      }
    };

    // Evaluate via CommerceFirewall
    const evaluation = CommerceFirewall.evaluate(commerceRequest);
    session.firewallEvaluations.push(evaluation);
    session.updatedAt = now;

    // --- CASE 1: FIREWALL BLOCKED THE REQUEST ---
    if (!evaluation.passed) {
      // Record buyer's blocked attempt
      const blockedOffer: NegotiationOffer = {
        id: `OFF-${Date.now().toString(36).toUpperCase()}`,
        round: nextRound,
        actor: session.buyerAgentId === 'agent-b-adversarial' ? 'ADVERSARIAL_AGENT' : 'BUYER_AGENT',
        proposedPrice: buyerProposedPrice,
        message: promptText,
        policyStatus: evaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT') ? 'OVERRIDDEN' : 'VIOLATION',
        explanation: evaluation.explanation,
        facts: evaluation.structuredFacts,
        timestamp: now,
      };
      session.offers.push(blockedOffer);

      // Handle gracefully: do NOT crash the session.
      // If it's a legitimate user encountering a constraint, keep session ACTIVE for retry.
      if (session.buyerAgentId === 'agent-b-adversarial') {
        session.status = 'BLOCKED';
      }

      return {
        session,
        firewallEvaluation: evaluation,
        status: 'BLOCKED',
        message: evaluation.explanation,
        suggestedAction: 'RETRY_SAFE',
        policyFacts: evaluation.structuredFacts,
      };
    }

    // --- CASE 2: FIREWALL APPROVED ---
    session.currentRound = nextRound;

    // Add buyer offer
    const buyerOffer: NegotiationOffer = {
      id: `OFF-${Date.now().toString(36).toUpperCase()}-B`,
      round: nextRound,
      actor: 'BUYER_AGENT',
      proposedPrice: buyerProposedPrice,
      message: promptText || `Proposing offer of ₹${buyerProposedPrice.toLocaleString('en-IN')}`,
      policyStatus: 'PASSED',
      explanation: evaluation.explanation,
      facts: evaluation.structuredFacts,
      timestamp: now,
    };
    session.offers.push(buyerOffer);

    const product = session.product;
    const floor = product.negotiation.floorPrice;
    const listed = product.price;

    // Check if buyer offer matches or exceeds listed price, or if intent is direct acceptance/checkout
    if (intent === 'ACCEPT_OFFER' || intent === 'CHECKOUT' || buyerProposedPrice >= listed) {
      session.status = 'SETTLED';
      session.finalPrice = buyerProposedPrice;
      session.finalDiscountPercent = ((listed - buyerProposedPrice) / listed) * 100;
      session.buyerConfirmed = customerConsent;

      // Check bundle threshold
      if (product.bundle && buyerProposedPrice >= product.bundle.minimumPrice) {
        session.finalBundle = product.bundle.freeGift;
      }

      return {
        session,
        firewallEvaluation: evaluation,
        status: 'SETTLED',
        message: `Settlement reached at ₹${buyerProposedPrice.toLocaleString('en-IN')}. Ready for Razorpay payment execution.`,
        suggestedAction: 'PROCEED_TO_PAYMENT',
        policyFacts: evaluation.structuredFacts,
      };
    }

    // Generate Merchant Counteroffer
    const merchantResponse = this.calculateMerchantCounterOffer(session, buyerProposedPrice, nextRound);
    
    const merchantOffer: NegotiationOffer = {
      id: `OFF-${Date.now().toString(36).toUpperCase()}-M`,
      round: nextRound,
      actor: 'MERCHANT_AGENT',
      proposedPrice: merchantResponse.counterPrice,
      message: merchantResponse.message,
      bundleOffered: merchantResponse.bundleOffered,
      policyStatus: 'PASSED',
      explanation: merchantResponse.explanation,
      facts: merchantResponse.facts,
      timestamp: new Date().toISOString(),
    };
    session.offers.push(merchantOffer);

    // If this was the final round, or if merchant matched buyer's price
    if (merchantResponse.counterPrice === buyerProposedPrice || nextRound >= session.maxRounds) {
      session.finalPrice = merchantResponse.counterPrice;
      session.finalDiscountPercent = ((listed - merchantResponse.counterPrice) / listed) * 100;
      session.finalBundle = merchantResponse.bundleOffered;
    }

    return {
      session,
      firewallEvaluation: evaluation,
      status: 'COUNTERED',
      message: merchantResponse.message,
      suggestedAction: nextRound >= session.maxRounds ? 'PROCEED_TO_PAYMENT' : 'CONTINUE',
      policyFacts: merchantResponse.facts,
    };
  }

  /**
   * Deterministic counteroffer algorithm ensuring merchant margin protection and smart bundling.
   */
  private static calculateMerchantCounterOffer(
    session: NegotiationSession, 
    buyerPrice: number, 
    round: number
  ): {
    counterPrice: number;
    bundleOffered: string | null;
    message: string;
    explanation: string;
    facts: DecisionFacts;
  } {
    const product = session.product;
    const listed = product.price;
    const floor = product.negotiation.floorPrice;
    const maxDiscount = product.negotiation.maxDiscountPercent;
    const maxRounds = session.maxRounds;

    let counterPrice = listed;
    let bundleOffered: string | null = null;
    let message = '';

    // Standard demo shoes case (Listed: ₹2,499, Floor: ₹2,200)
    // Round 1 (Buyer ₹2,200) -> Merchant counters at ₹2,399
    // Round 2 (Buyer ₹2,250) -> Merchant counters at ₹2,299 with free Sports Socks
    // Round 3 (Buyer ₹2,299 or Deal) -> Settle at ₹2,299 with free Sports Socks

    if (product.id === 'shoe-001') {
      if (round === 1) {
        counterPrice = 2399;
        message = `I can offer ₹2,399 for the AeroStride Pro Running Shoes.`;
      } else if (round === 2) {
        counterPrice = 2299;
        bundleOffered = product.bundle?.freeGift || 'Pro Cushion Sports Socks (Pair)';
        message = `I can't go that low on the shoes alone, but I can offer ₹2,299 with free ${bundleOffered}.`;
      } else {
        counterPrice = 2299;
        bundleOffered = product.bundle?.freeGift || 'Pro Cushion Sports Socks (Pair)';
        message = `Final merchant offer: ₹2,299 including free ${bundleOffered}.`;
      }
    } else {
      // General mathematical concession algorithm for other catalog products
      // Concession curve: Round 1 (35% concession towards floor), Round 2 (70%), Round 3 (100% allowed concession)
      const allowedDiscountAmount = (listed * (maxDiscount / 100));
      const targetMinPrice = Math.max(floor, listed - allowedDiscountAmount);

      const concessionFactor = round === 1 ? 0.4 : round === 2 ? 0.75 : 1.0;
      const calculatedDiscount = allowedDiscountAmount * concessionFactor;
      counterPrice = Math.round(listed - calculatedDiscount);

      // Never go below floor
      if (counterPrice < floor) counterPrice = floor;

      // Check bundle threshold
      if (product.bundle && counterPrice >= product.bundle.minimumPrice) {
        bundleOffered = product.bundle.freeGift;
        message = `I can offer ₹${counterPrice.toLocaleString('en-IN')} with complimentary ${bundleOffered}.`;
      } else {
        message = `I can offer ₹${counterPrice.toLocaleString('en-IN')} for ${product.name}.`;
      }
    }

    const discountAmount = listed - counterPrice;
    const discountPercent = (discountAmount / listed) * 100;
    const giftAllowed = !!(product.bundle && counterPrice >= product.bundle.minimumPrice);

    const facts: DecisionFacts = {
      decision: 'COUNTER',
      productId: product.id,
      productName: product.name,
      listedPrice: listed,
      proposedPrice: counterPrice,
      floorPrice: floor,
      discountAmount,
      discountPercent,
      maxDiscountPercent: maxDiscount,
      round,
      maxRounds,
      giftAllowed,
      giftGranted: bundleOffered,
      buyerConfirmed: false,
      checksPassed: ['CHECK_1_AGENT_IDENTITY', 'CHECK_2_PRODUCT_PERMISSION', 'CHECK_5_PRICE_BOUNDARY', 'CHECK_6_DISCOUNT_BOUNDARY', 'CHECK_8_PROMPT_INJECTION_SHIELD'],
      checksFailed: [],
      overrideDetected: false,
      timestamp: new Date().toISOString(),
    };

    const explanation = generateStructuredExplanation(facts);

    return {
      counterPrice,
      bundleOffered,
      message,
      explanation,
      facts,
    };
  }
}
