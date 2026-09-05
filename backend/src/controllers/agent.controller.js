const { db } = require('../config/database');
const Agent = require('../models/Agent');
const { AppError } = require('../utils/errors');

exports.getAgents = (req, res) => {
  const agents = Array.from(db.agents.values());
  res.json({
    success: true,
    count: agents.length,
    agents,
  });
};

exports.registerAgent = (req, res, next) => {
  try {
    const { agentId, name, type = 'LEGITIMATE', whitelisted = true } = req.body;
    if (!agentId) {
      throw new AppError('AGENT_ID_REQUIRED', 'Agent ID is required for registration.', 400);
    }

    const agent = new Agent({
      agentId,
      name: name || agentId,
      status: 'ACTIVE',
      whitelisted,
      type,
    });

    db.agents.set(agentId, agent);

    res.status(201).json({
      success: true,
      message: `Agent '${agentId}' registered on merchant registry.`,
      agent,
    });
  } catch (err) {
    next(err);
  }
};
