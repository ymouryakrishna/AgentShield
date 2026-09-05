const AuditService = require('../services/audit.service');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { agentId, actor, action, status, result, limit } = req.query;
    const logs = await AuditService.getAuditLogs({ agentId, actor, action, status, result, limit });

    res.json({
      success: true,
      count: logs.length,
      logs,
      events: logs,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAuditEvents = async (req, res, next) => {
  try {
    const { agentId, actor, action, status, result, limit } = req.query;
    const events = await AuditService.getAuditLogs({ agentId, actor, action, status, result, limit });

    res.json({
      success: true,
      count: events.length,
      events,
      logs: events,
    });
  } catch (err) {
    next(err);
  }
};
