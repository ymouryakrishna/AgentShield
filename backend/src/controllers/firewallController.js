const CommerceFirewall = require('../services/firewall/commerceFirewall');
const AuditService = require('../services/audit/auditService');

exports.evaluate = (req, res) => {
  try {
    const request = {
      requestId: req.body.requestId || `REQ-${Date.now().toString(36).toUpperCase()}`,
      agentId: req.body.agentId || 'agent-a-legitimate',
      agentName: req.body.agentName,
      intent: req.body.intent || 'NEGOTIATE',
      productId: req.body.productId || 'shoe-001',
      proposedPrice: Number(req.body.proposedPrice) || 2299,
      quantity: Number(req.body.quantity) || 1,
      round: Number(req.body.round) || 1,
      promptText: req.body.promptText || '',
      customerConsent: !!req.body.customerConsent,
      context: req.body.context,
    };

    const evaluation = CommerceFirewall.evaluate(request);

    if (!evaluation.passed) {
      AuditService.log({
        actor: request.agentId === 'agent-b-adversarial' ? 'AGENT_B_ADVERSARIAL' : 'FIREWALL',
        action: evaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT') ? 'POLICY_BLOCKED' : 'POLICY_CHECK',
        result: 'BLOCKED',
        reason: evaluation.explanation,
        metadata: { violations: evaluation.violations, signals: evaluation.signals },
      });
    }

    res.json({
      success: true,
      evaluation,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'FIREWALL_EVALUATE_ERROR', message: err.message });
  }
};
