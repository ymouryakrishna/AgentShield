const env = require('../config/env');
const { AppError } = require('../utils/errors');

const agentRequests = new Map();

function rateLimitMiddleware(req, res, next) {
  const agentId = req.body?.agentId || req.headers['x-agent-id'] || req.ip || 'anonymous';
  const now = Date.now();

  let record = agentRequests.get(agentId);
  if (!record || now - record.windowStart > env.RATE_LIMIT_WINDOW_MS) {
    record = { count: 1, windowStart: now };
    agentRequests.set(agentId, record);
    return next();
  }

  record.count += 1;
  agentRequests.set(agentId, record);

  // Allow high threshold for automated test suites and localhost demo calls
  const isLocalOrTest = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || process.env.NODE_ENV === 'test';
  const effectiveLimit = isLocalOrTest ? 500 : env.RATE_LIMIT_MAX;

  if (record.count > effectiveLimit) {
    return next(new AppError(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded for agent '${agentId}'. Allowed: ${env.RATE_LIMIT_MAX} requests per minute.`,
      429
    ));
  }

  next();
}

module.exports = rateLimitMiddleware;
