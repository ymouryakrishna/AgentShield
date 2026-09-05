const { db } = require('../config/database');
const { AuthorizationError } = require('../utils/errors');

function verifyAgentAuth(req, res, next) {
  const agentId = req.body?.agentId || req.headers['x-agent-id'];
  if (!agentId) {
    return next();
  }

  const agent = db.agents.get(agentId);
  if (!agent || agent.status !== 'ACTIVE' || agent.whitelisted === false) {
    return next(new AuthorizationError(`Agent '${agentId}' is not authorized or disabled on merchant registry.`, 'AGENT_NOT_AUTHORIZED'));
  }

  req.agent = agent;
  next();
}

module.exports = {
  verifyAgentAuth,
};
