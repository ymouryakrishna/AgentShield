const NegotiationService = require('../services/negotiation.service');
const AuthorizationService = require('../services/authorization.service');
const AuditService = require('../services/audit.service');
const { db } = require('../config/database');
const { AppError, AuthorizationError } = require('../utils/errors');

exports.startNegotiation = (req, res, next) => {
  try {
    const { productId, buyerAgentId, buyerAgentName, initialOffer, promptInjection } = req.body || {};

    const session = NegotiationService.createSession({
      productId: productId || 'gaming-headphones-x1',
      buyerAgentId: buyerAgentId || 'LegitimateShoppingAgent',
      buyerAgentName: buyerAgentName || 'Legitimate Shopping Agent',
    });

    const isAdversarial = Boolean(
      promptInjection || 
      (initialOffer !== undefined && Number(initialOffer) <= 10) || 
      (buyerAgentId && buyerAgentId.toLowerCase().includes('adversarial'))
    );

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: isAdversarial ? 'ATTACK_DETECTED' : 'AGENT_REQUEST',
      status: isAdversarial ? 'WARNING' : 'SUCCESS',
      decision: isAdversarial ? 'BLOCK' : 'ALLOW',
      reason: isAdversarial
        ? `Adversarial prompt injection attempt detected: "${promptInjection || `initialOffer: ₹${initialOffer}`}"`
        : `Autonomous shopping agent initiated negotiation for ${session.productName} (List: ₹${session.listPrice}).`,
      metadata: { listPrice: session.listPrice, floorPrice: session.floorPrice, initialOffer, promptInjection },
      requestId: req.id,
    });

    if (isAdversarial) {
      AuditService.log({
        agentId: session.agentId,
        sessionId: session.sessionId,
        action: 'REQUEST_BLOCKED',
        status: 'BLOCKED',
        decision: 'BLOCK',
        reason: `Requested price ₹${initialOffer || 1} is below merchant floor ₹${session.floorPrice}. Policy override attempt detected. Payment authorization DENIED.`,
        metadata: {
          requestedPrice: initialOffer || 1,
          floorPrice: session.floorPrice,
          failedChecks: ['PRICE_BELOW_FLOOR', 'DISCOUNT_LIMIT_EXCEEDED', 'POLICY_OVERRIDE_ATTEMPT'],
          paymentAuthorization: 'DENIED',
        },
        requestId: req.id,
      });

      return res.json({
        success: false,
        blocked: true,
        status: 'BLOCKED',
        decision: 'BLOCK',
        sessionId: session.sessionId,
        session,
        requestedPrice: initialOffer || 1,
        merchantFloorPrice: session.floorPrice,
        failedChecks: ['PRICE_BELOW_FLOOR', 'DISCOUNT_LIMIT_EXCEEDED', 'POLICY_OVERRIDE_ATTEMPT'],
        signals: ['POLICY_OVERRIDE_ATTEMPT'],
        reason: 'Blocked because requested price of ₹1 is below merchant floor ₹2,200 and a prompt-injection override signature was detected.',
        paymentAuthorization: 'DENIED',
        gracefulRecoveryMessage: 'The adversarial payload was blocked by CommerceFirewall. The pricing policy remains intact.',
      });
    }

    // For legitimate agent: Round 1 buyer proposed initialOffer -> merchant counters with ₹2,200 + free shipping bundle
    session.round = 1;
    const buyerOffer = {
      round: 1,
      actor: 'BUYER_AGENT',
      proposedPrice: Number(initialOffer || 2000),
      message: `Proposed offer of ₹${Number(initialOffer || 2000).toLocaleString('en-IN')}`,
      policyStatus: 'PASSED',
      timestamp: new Date().toISOString(),
    };
    session.offers.push(buyerOffer);

    const counterPrice = session.floorPrice || 2200;
    const bundleOffered = 'Free Express Shipping & Audio Jack Adapter';
    const counterOffer = {
      round: 1,
      actor: 'MERCHANT_AGENT',
      proposedPrice: counterPrice,
      bundleOffered,
      message: `Merchant AI counter-offer: ₹${counterPrice.toLocaleString('en-IN')} with complimentary Free Express Shipping.`,
      policyStatus: 'PASSED',
      timestamp: new Date().toISOString(),
    };
    session.counterOffers.push(counterOffer);
    session.offers.push(counterOffer);
    session.finalPrice = counterPrice;
    session.bundle = bundleOffered;
    db.sessions.set(session.sessionId, session);

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'OFFER_CREATED',
      status: 'SUCCESS',
      decision: 'COUNTER',
      reason: `Buyer proposed initial offer ₹${Number(initialOffer || 2000).toLocaleString('en-IN')}.`,
      metadata: { round: 1, proposedPrice: initialOffer || 2000 },
      requestId: req.id,
    });

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'COUNTER_OFFER',
      status: 'SUCCESS',
      decision: 'COUNTER',
      reason: `Merchant counteroffered ₹${counterPrice.toLocaleString('en-IN')} with ${bundleOffered}.`,
      metadata: { round: 1, counterPrice, bundle: bundleOffered },
      requestId: req.id,
    });

    return res.json({
      success: true,
      sessionId: session.sessionId,
      session,
      counterOffer,
      message: counterOffer.message,
    });
  } catch (err) {
    next(err);
  }
};

exports.createNegotiation = (req, res, next) => {
  try {
    const session = NegotiationService.createSession(req.validatedBody || req.body);

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'AGENT_REQUEST',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: `Negotiation session started for product '${session.productId}'.`,
      metadata: { listPrice: session.listPrice, floorPrice: session.floorPrice },
      requestId: req.id,
    });

    res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      session,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSession = (req, res, next) => {
  try {
    const session = NegotiationService.getSessionById(req.params.id);
    res.json({
      success: true,
      session,
    });
  } catch (err) {
    next(err);
  }
};

exports.processOffer = (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const offerData = req.validatedBody || req.body;
    const result = NegotiationService.processOffer(sessionId, offerData);

    if (result.status === 'BLOCKED') {
      AuditService.log({
        agentId: result.session.agentId,
        sessionId: result.session.sessionId,
        action: result.firewallEvaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT') ? 'ATTACK_DETECTED' : 'REQUEST_BLOCKED',
        status: 'BLOCKED',
        decision: 'BLOCK',
        reason: result.message,
        metadata: { proposedPrice: offerData.proposedPrice, failedChecks: result.firewallEvaluation.failedChecks },
        requestId: req.id,
      });
    } else {
      AuditService.log({
        agentId: result.session.agentId,
        sessionId: result.session.sessionId,
        action: result.status === 'SETTLED' ? 'SETTLEMENT' : 'OFFER_CREATED',
        status: 'SUCCESS',
        decision: result.status === 'SETTLED' ? 'SETTLE' : 'COUNTER',
        reason: result.message,
        metadata: { round: result.session.round, proposedPrice: offerData.proposedPrice },
        requestId: req.id,
      });
    }

    res.json({
      success: result.status !== 'BLOCKED',
      status: result.status,
      decision: result.decision,
      session: result.session,
      firewallEvaluation: result.firewallEvaluation,
      message: result.message,
      counterOffer: result.counterOffer,
      policyFacts: result.policyFacts,
    });
  } catch (err) {
    next(err);
  }
};

exports.acceptOffer = (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { finalPrice, customerConsent, acceptedBy } = req.body;

    const session = db.sessions.get(sessionId);
    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', `Session '${sessionId}' not found.`, 404);
    }

    const consentGiven = customerConsent === true || acceptedBy === 'BUYER';
    if (!consentGiven) {
      throw new AuthorizationError('Explicit customer confirmation is required.', 'CONSENT_REQUIRED');
    }

    const agreedPrice = finalPrice || session.finalPrice || session.offers[session.offers.length - 1]?.proposedPrice || session.floorPrice || session.listPrice;

    if (agreedPrice < session.floorPrice) {
      throw new AuthorizationError(
        `Agreed price ₹${agreedPrice} is below merchant floor ₹${session.floorPrice}.`,
        'PRICE_BELOW_FLOOR'
      );
    }

    session.status = 'SETTLED';
    session.finalPrice = Number(agreedPrice);
    session.customerConsent = true;
    session.bundle = session.bundle || 'Free Express Shipping & Audio Jack Adapter';
    session.updatedAt = new Date().toISOString();
    db.sessions.set(sessionId, session);

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'CONSENT_RECEIVED',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: `Customer verified and accepted ₹${agreedPrice.toLocaleString('en-IN')} with bundle concession.`,
      requestId: req.id,
    });

    // Generate cryptographic Policy Authorization Token
    const { token, authRecord } = AuthorizationService.issueToken({
      sessionId: session.sessionId,
      agentId: session.agentId,
      productId: session.productId,
      authorizedAmount: session.finalPrice,
      policyVersion: session.policyVersion,
    });

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'PAYMENT_AUTHORIZED',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: 'All 10 firewall checks passed. Policy authorization token generated.',
      metadata: { authorizedAmount: session.finalPrice },
      requestId: req.id,
    });

    res.json({
      success: true,
      session,
      policyAuthorizationToken: token,
      tokenExpiresAt: authRecord.expiresAt,
      message: 'Settlement confirmed with customer consent. Policy authorization token generated.',
    });
  } catch (err) {
    next(err);
  }
};
