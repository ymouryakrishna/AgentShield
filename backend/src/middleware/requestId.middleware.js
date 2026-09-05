const crypto = require('crypto');

function requestIdMiddleware(req, res, next) {
  const reqId = req.headers['x-request-id'] || `req_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  res.setHeader('X-Agent-Shield-Protected', 'true');
  next();
}

module.exports = requestIdMiddleware;
