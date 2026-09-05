const CommerceFirewall = require('../firewall/commerceFirewall');
const { generateStructuredExplanation } = require('../../utils/explainability');
const { db } = require('../../config/database');

class BoundedNegotiationEngine {
  static createSession(product, buyerAgentId, buyerAgentName) {
    const now = new Date().toISOString();
    const sessionId = `NGS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const session = {
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

    db.sessions.set(sessionId, session);
    return session;
  }

  static processBuyerOffer(session, buyerProposedPrice, promptText = '', customerConsent = false, intent = 'NEGOTIATE') {
    const nextRound = session.currentRound + 1;
    const now = new Date().toISOString();

    const commerceRequest = {
      requestId: `REQ-${Date.now().toString(36).toUpperCase()}`,
      agentId: session.buyerAgentId,
      agentName: session.buyerAgentName,
      intent,
      productId: session.productId,
      proposedPrice: Number(buyerProposedPrice),
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

    const evaluation = CommerceFirewall.evaluate(commerceRequest);
    session.firewallEvaluations.push(evaluation);
    session.updatedAt = now;

    // If Firewall blocked the request
    if (!evaluation.passed) {
      const blockedOffer = {
        id: `OFF-${Date.now().toString(36).toUpperCase()}`,
        round: nextRound,
        actor: session.buyerAgentId === 'agent-b-adversarial' ? 'ADVERSARIAL_AGENT' : 'BUYER_AGENT',
        proposedPrice: Number(buyerProposedPrice),
        message: promptText,
        policyStatus: evaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT') ? 'OVERRIDDEN' : 'VIOLATION',
        explanation: evaluation.explanation,
        facts: evaluation.structuredFacts,
        timestamp: now,
      };
      session.offers.push(blockedOffer);

      if (session.buyerAgentId === 'agent-b-adversarial') {
        session.status = 'BLOCKED';
      }

      db.sessions.set(session.id, session);

      return {
        session,
        firewallEvaluation: evaluation,
        status: 'BLOCKED',
        message: evaluation.explanation,
        suggestedAction: 'RETRY_SAFE',
        policyFacts: evaluation.structuredFacts,
      };
    }

    // If Firewall approved
    session.currentRound = nextRound;

    const buyerOffer = {
      id: `OFF-${Date.now().toString(36).toUpperCase()}-B`,
      round: nextRound,
      actor: 'BUYER_AGENT',
      proposedPrice: Number(buyerProposedPrice),
      message: promptText || `Proposing offer of ₹${Number(buyerProposedPrice).toLocaleString('en-IN')}`,
      policyStatus: 'PASSED',
      explanation: evaluation.explanation,
      facts: evaluation.structuredFacts,
      timestamp: now,
    };
    session.offers.push(buyerOffer);

    const product = session.product;
    const listed = product.price;

    if (intent === 'ACCEPT_OFFER' || intent === 'CHECKOUT' || buyerProposedPrice >= listed) {
      session.status = 'SETTLED';
      session.finalPrice = Number(buyerProposedPrice);
      session.finalDiscountPercent = ((listed - buyerProposedPrice) / listed) * 100;
      session.buyerConfirmed = customerConsent;

      if (product.bundle && buyerProposedPrice >= product.bundle.minimumPrice) {
        session.finalBundle = product.bundle.freeGift;
      }

      db.sessions.set(session.id, session);

      return {
        session,
        firewallEvaluation: evaluation,
        status: 'SETTLED',
        message: `Settlement reached at ₹${Number(buyerProposedPrice).toLocaleString('en-IN')}. Ready for Razorpay payment execution.`,
        suggestedAction: 'PROCEED_TO_PAYMENT',
        policyFacts: evaluation.structuredFacts,
      };
    }

    // Calculate Merchant Counteroffer
    const merchantResponse = this.calculateMerchantCounterOffer(session, Number(buyerProposedPrice), nextRound);
    
    const merchantOffer = {
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

    if (merchantResponse.counterPrice === buyerProposedPrice || nextRound >= session.maxRounds) {
      session.finalPrice = merchantResponse.counterPrice;
      session.finalDiscountPercent = ((listed - merchantResponse.counterPrice) / listed) * 100;
      session.finalBundle = merchantResponse.bundleOffered;
    }

    db.sessions.set(session.id, session);

    return {
      session,
      firewallEvaluation: evaluation,
      status: 'COUNTERED',
      message: merchantResponse.message,
      suggestedAction: nextRound >= session.maxRounds ? 'PROCEED_TO_PAYMENT' : 'CONTINUE',
      policyFacts: merchantResponse.facts,
    };
  }

  static calculateMerchantCounterOffer(session, buyerPrice, round) {
    const product = session.product;
    const listed = product.price;
    const floor = product.negotiation.floorPrice;
    const maxDiscount = product.negotiation.maxDiscountPercent;
    const maxRounds = session.maxRounds;

    let counterPrice = listed;
    let bundleOffered = null;
    let message = '';

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
      const allowedDiscountAmount = (listed * (maxDiscount / 100));
      const concessionFactor = round === 1 ? 0.4 : round === 2 ? 0.75 : 1.0;
      const calculatedDiscount = allowedDiscountAmount * concessionFactor;
      counterPrice = Math.round(listed - calculatedDiscount);

      if (counterPrice < floor) counterPrice = floor;

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

    const facts = {
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

module.exports = BoundedNegotiationEngine;
