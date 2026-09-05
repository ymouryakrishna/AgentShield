const { db } = require('../config/database');
const CommerceFirewall = require('./firewall.service');
const BundleService = require('./bundle.service');
const ExplainabilityService = require('./explainability.service');
const NegotiationSession = require('../models/NegotiationSession');
const { AppError, NotFoundError } = require('../utils/errors');

class NegotiationService {
  static createSession(params) {
    const { productId = 'running-shoes', buyerAgentId = 'agent_demo_legitimate', buyerAgentName } = params;
    const product = db.products.get(productId);

    if (!product) {
      throw new NotFoundError(`Product '${productId}' not found.`);
    }

    const session = new NegotiationSession({
      agentId: buyerAgentId,
      agentName: buyerAgentName || (buyerAgentId.includes('adversarial') ? 'Agent B (Adversarial Prober)' : 'Agent A (Smart Shopper AI)'),
      productId: product.id,
      listPrice: product.listPrice,
      floorPrice: product.floorPrice,
      maxRounds: product.maxNegotiationRounds,
      status: 'ACTIVE',
    });

    db.sessions.set(session.sessionId, session);
    return session;
  }

  static processOffer(sessionId, offerParams) {
    let session = db.sessions.get(sessionId);
    if (!session) {
      const defaultProduct = db.products.get(offerParams.productId || 'running-shoes');
      session = this.createSession({
        productId: defaultProduct.id,
        buyerAgentId: offerParams.buyerAgentId || 'agent_demo_legitimate',
      });
      session.sessionId = sessionId;
      session.id = sessionId;
      db.sessions.set(sessionId, session);
    }

    const nextRound = session.round + 1;
    const proposedPrice = Number(offerParams.proposedPrice);
    const intent = offerParams.intent || (nextRound >= session.maxRounds && proposedPrice >= session.floorPrice ? 'ACCEPT_OFFER' : 'NEGOTIATE');
    const customerConsent = !!offerParams.customerConsent;

    const commerceRequest = {
      requestId: `req_${Date.now().toString(36)}`,
      agentId: session.agentId,
      intent,
      productId: session.productId,
      proposedPrice,
      quantity: 1,
      round: nextRound,
      promptText: offerParams.promptText || '',
      customerConsent,
      context: {
        sessionId: session.sessionId,
        previousOffers: session.offers,
      }
    };

    // 1. Evaluate Inbound Request through Commerce Firewall
    const firewallResult = CommerceFirewall.evaluate(commerceRequest);

    const now = new Date().toISOString();

    if (!firewallResult.allowed) {
      session.status = session.agentId.includes('adversarial') ? 'BLOCKED' : session.status;
      const blockedOffer = {
        round: nextRound,
        actor: session.agentId.includes('adversarial') ? 'ADVERSARIAL_AGENT' : 'BUYER_AGENT',
        proposedPrice,
        message: offerParams.promptText || '',
        policyStatus: 'BLOCKED',
        explanation: firewallResult.explanation,
        failedChecks: firewallResult.failedChecks,
        timestamp: now,
      };
      session.offers.push(blockedOffer);
      session.updatedAt = now;
      db.sessions.set(session.sessionId, session);

      return {
        session,
        firewallEvaluation: firewallResult,
        status: 'BLOCKED',
        decision: 'BLOCK',
        message: firewallResult.explanation,
        policyFacts: firewallResult.structuredFacts,
      };
    }

    // 2. Process Valid Buyer Offer
    session.round = nextRound;
    const buyerOffer = {
      round: nextRound,
      actor: 'BUYER_AGENT',
      proposedPrice,
      message: offerParams.promptText || `Proposed offer ₹${proposedPrice.toLocaleString('en-IN')}`,
      policyStatus: 'PASSED',
      timestamp: now,
    };
    session.offers.push(buyerOffer);

    const product = db.products.get(session.productId);
    const bundleEval = BundleService.evaluateBundle(product, proposedPrice);

    // If buyer settled or accepted
    if (intent === 'ACCEPT_OFFER' || intent === 'CHECKOUT' || intent === 'PURCHASE') {
      session.status = 'SETTLED';
      session.finalPrice = proposedPrice;
      session.bundle = bundleEval.freeGift;
      session.customerConsent = customerConsent;
      session.updatedAt = now;
      db.sessions.set(session.sessionId, session);

      return {
        session,
        firewallEvaluation: firewallResult,
        status: 'SETTLED',
        decision: 'SETTLE',
        message: `Settlement reached at ₹${proposedPrice.toLocaleString('en-IN')}${session.bundle ? ` with complimentary ${session.bundle}` : ''}.`,
        policyFacts: firewallResult.structuredFacts,
      };
    }

    // Calculate Merchant Counteroffer
    const counterResult = this.calculateMerchantCounter(session, proposedPrice, nextRound, product);
    session.counterOffers.push(counterResult.counterOffer);
    session.offers.push(counterResult.counterOffer);

    if (counterResult.isFinalSettlement) {
      session.finalPrice = counterResult.counterPrice;
      session.bundle = counterResult.bundleOffered;
    }

    session.updatedAt = now;
    db.sessions.set(session.sessionId, session);

    return {
      session,
      firewallEvaluation: firewallResult,
      status: 'COUNTERED',
      decision: 'COUNTER',
      message: counterResult.message,
      counterOffer: counterResult.counterOffer,
      policyFacts: counterResult.facts,
    };
  }

  static calculateMerchantCounter(session, buyerPrice, round, product) {
    const listPrice = product.listPrice;
    const floorPrice = product.floorPrice;
    const maxRounds = session.maxRounds;

    let counterPrice = listPrice;
    let bundleOffered = null;
    let message = '';
    let isFinalSettlement = false;

    if (product.id === 'running-shoes' || product.aliasId === 'shoe-001') {
      if (round === 1) {
        counterPrice = 2399;
        message = 'Merchant AI counteroffer: ₹2,399 for Performance Running Shoes.';
      } else if (round === 2) {
        counterPrice = 2299;
        bundleOffered = 'Sports Socks';
        message = 'Merchant AI counteroffer: ₹2,299 with complimentary Sports Socks.';
      } else {
        counterPrice = 2299;
        bundleOffered = 'Sports Socks';
        message = 'Final merchant offer: ₹2,299 including free Sports Socks.';
        isFinalSettlement = true;
      }
    } else {
      const allowedDiscount = listPrice - floorPrice;
      const concessionStep = (allowedDiscount / maxRounds) * round;
      counterPrice = Math.max(floorPrice, Math.round(listPrice - concessionStep));
      const bundleEval = BundleService.evaluateBundle(product, counterPrice);
      bundleOffered = bundleEval.freeGift;
      message = `Merchant counteroffer: ₹${counterPrice.toLocaleString('en-IN')}${bundleOffered ? ` + ${bundleOffered}` : ''}.`;
    }

    const discountAmount = listPrice - counterPrice;
    const discountPercent = listPrice > 0 ? (discountAmount / listPrice) * 100 : 0;

    const facts = {
      decision: 'COUNTER',
      productId: product.id,
      productName: product.name,
      listPrice,
      proposedPrice: counterPrice,
      floorPrice,
      discountAmount,
      discountPercent: Number(discountPercent.toFixed(1)),
      maxDiscountPercent: product.maxDiscountPercent,
      round,
      maxRounds,
      bundleAllowed: !!bundleOffered,
      bundleGranted: bundleOffered,
      customerConsent: false,
      timestamp: new Date().toISOString(),
    };

    const counterOffer = {
      round,
      actor: 'MERCHANT_AGENT',
      proposedPrice: counterPrice,
      message,
      bundleOffered,
      policyStatus: 'PASSED',
      facts,
      timestamp: new Date().toISOString(),
    };

    return {
      counterPrice,
      bundleOffered,
      message,
      counterOffer,
      facts,
      isFinalSettlement,
    };
  }

  static getSessionById(sessionId) {
    const session = db.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundError(`Negotiation session '${sessionId}' not found.`);
    }
    return session;
  }
}

module.exports = NegotiationService;
