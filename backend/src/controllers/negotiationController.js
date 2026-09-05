const BoundedNegotiationEngine = require('../services/negotiation/negotiationEngine');
const AuditService = require('../services/audit/auditService');
const { db } = require('../config/database');

exports.createNegotiation = (req, res) => {
  try {
    const { productId = 'shoe-001', buyerAgentId = 'agent-a-legitimate', buyerAgentName } = req.body;
    const product = db.products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, code: 'PRODUCT_NOT_FOUND', message: `Product ${productId} not found` });
    }

    const session = BoundedNegotiationEngine.createSession(product, buyerAgentId, buyerAgentName);

    AuditService.log({
      actor: buyerAgentId === 'agent-b-adversarial' ? 'AGENT_B_ADVERSARIAL' : 'AGENT_A_LEGITIMATE',
      action: 'NEGOTIATION_STARTED',
      result: 'SUCCESS',
      reason: `Negotiation session ${session.id} initiated for ${product.name} (Listed: ₹${product.price}).`,
      relatedSessionId: session.id,
      metadata: { productId, floorPrice: product.negotiation.floorPrice },
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, code: 'NEGOTIATION_CREATE_ERROR', message: err.message });
  }
};

exports.processOffer = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { proposedPrice, promptText = '', customerConsent = false, intent = 'NEGOTIATE' } = req.body;

    let session = db.sessions.get(sessionId);
    if (!session) {
      const defaultProduct = db.products.find(p => p.id === (req.body.productId || 'shoe-001'));
      session = BoundedNegotiationEngine.createSession(defaultProduct, req.body.buyerAgentId || 'agent-a-legitimate');
      session.id = sessionId;
      db.sessions.set(sessionId, session);
    }

    if (typeof proposedPrice !== 'number' || isNaN(proposedPrice)) {
      return res.status(400).json({ success: false, code: 'INVALID_PRICE', message: 'Proposed price must be a valid number.' });
    }

    const result = BoundedNegotiationEngine.processBuyerOffer(
      session,
      proposedPrice,
      promptText,
      customerConsent,
      intent
    );

    // Audit logs
    if (result.status === 'BLOCKED') {
      const isOverride = result.firewallEvaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT');

      AuditService.log({
        actor: session.buyerAgentId === 'agent-b-adversarial' ? 'AGENT_B_ADVERSARIAL' : 'AGENT_A_LEGITIMATE',
        action: 'OFFER_CREATED',
        result: 'WARNING',
        reason: `Buyer offer proposal: ₹${proposedPrice} with prompt "${promptText}"`,
        relatedSessionId: session.id,
        metadata: { proposedPrice, promptText },
      });

      if (isOverride) {
        AuditService.log({
          actor: 'FIREWALL',
          action: 'POLICY_BLOCKED',
          result: 'BLOCKED',
          reason: `Detected adversarial override pattern: ${result.firewallEvaluation.violations.join(', ')}`,
          relatedSessionId: session.id,
          metadata: { violations: result.firewallEvaluation.violations },
        });
      }

      AuditService.log({
        actor: 'FIREWALL',
        action: 'POLICY_BLOCKED',
        result: 'BLOCKED',
        reason: result.message,
        relatedSessionId: session.id,
        metadata: { proposedPrice, floorPrice: session.product.negotiation.floorPrice },
      });
    } else {
      AuditService.log({
        actor: 'AGENT_A_LEGITIMATE',
        action: 'OFFER_CREATED',
        result: 'SUCCESS',
        reason: `Buyer offered ₹${Number(proposedPrice).toLocaleString('en-IN')} in round ${result.session.currentRound}.`,
        relatedSessionId: session.id,
      });

      if (result.status === 'COUNTERED') {
        const lastOffer = result.session.offers[result.session.offers.length - 1];
        AuditService.log({
          actor: 'MERCHANT',
          action: 'COUNTER_OFFER',
          result: 'INFO',
          reason: `Merchant counteroffered ₹${Number(lastOffer.proposedPrice).toLocaleString('en-IN')}${lastOffer.bundleOffered ? ` + ${lastOffer.bundleOffered}` : ''}`,
          relatedSessionId: session.id,
        });
      }
    }

    res.json({
      success: result.status !== 'BLOCKED',
      status: result.status,
      session: result.session,
      firewallEvaluation: result.firewallEvaluation,
      message: result.message,
      suggestedAction: result.suggestedAction,
      policyFacts: result.policyFacts,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'OFFER_PROCESS_ERROR', message: err.message });
  }
};

exports.acceptOffer = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { finalPrice, customerConsent = true } = req.body;

    const session = db.sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found` });
    }

    if (!customerConsent) {
      return res.status(400).json({ success: false, code: 'CONSENT_REQUIRED', message: 'Customer consent is required to authorize payment.' });
    }

    const agreedPrice = finalPrice || session.finalPrice || session.offers[session.offers.length - 1]?.proposedPrice || session.product.price;

    if (agreedPrice < session.product.negotiation.floorPrice) {
      return res.status(400).json({
        success: false,
        code: 'PRICE_BELOW_FLOOR',
        message: `Agreed price ₹${agreedPrice} is below merchant floor of ₹${session.product.negotiation.floorPrice}.`
      });
    }

    session.status = 'SETTLED';
    session.finalPrice = Number(agreedPrice);
    session.finalDiscountPercent = ((session.product.price - agreedPrice) / session.product.price) * 100;
    session.buyerConfirmed = true;
    session.updatedAt = new Date().toISOString();

    db.sessions.set(sessionId, session);

    AuditService.log({
      actor: 'CUSTOMER',
      action: 'BUYER_CONFIRMED',
      result: 'SUCCESS',
      reason: `Customer confirmed final agreed price of ₹${agreedPrice.toLocaleString('en-IN')}.`,
      relatedSessionId: session.id,
    });

    const policyAuthorizationToken = `AUTH_TOKEN_POLICY_PASSED_${session.id}_${Date.now()}`;

    AuditService.log({
      actor: 'FIREWALL',
      action: 'POLICY_APPROVED',
      result: 'SUCCESS',
      reason: `Deterministic policy checks approved. Policy token issued: ${policyAuthorizationToken}`,
      relatedSessionId: session.id,
    });

    res.json({
      success: true,
      session,
      policyAuthorizationToken,
      message: 'Settlement confirmed. Ready for Razorpay checkout.',
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'ACCEPT_OFFER_ERROR', message: err.message });
  }
};
