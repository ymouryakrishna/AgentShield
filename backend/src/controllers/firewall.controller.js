const CommerceFirewall = require('../services/firewall.service');
const AuditService = require('../services/audit.service');

exports.evaluateRequest = (req, res, next) => {
  try {
    const payload = req.validatedBody || req.body;
    const evaluation = CommerceFirewall.evaluate(payload);

    if (!evaluation.allowed) {
      AuditService.log({
        agentId: payload.agentId,
        action: evaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT') ? 'ATTACK_DETECTED' : 'REQUEST_BLOCKED',
        status: 'BLOCKED',
        decision: 'BLOCK',
        reason: evaluation.explanation,
        metadata: { failedChecks: evaluation.failedChecks, signals: evaluation.signals },
        requestId: req.id,
      });
    }

    res.json({
      success: true,
      allowed: evaluation.allowed,
      decision: evaluation.decision,
      evaluation,
    });
  } catch (err) {
    next(err);
  }
};
