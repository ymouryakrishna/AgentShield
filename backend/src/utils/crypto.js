const crypto = require('crypto');
const env = require('../config/env');

function generateHmacSha256(data, secret = env.POLICY_TOKEN_SECRET) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function verifyHmacSha256(data, signature, secret = env.POLICY_TOKEN_SECRET) {
  const expected = generateHmacSha256(data, secret);
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
}

function generateRandomToken(prefix = 'TOK') {
  return `${prefix}_${crypto.randomBytes(16).toString('hex')}`;
}

module.exports = {
  generateHmacSha256,
  verifyHmacSha256,
  generateRandomToken,
};
