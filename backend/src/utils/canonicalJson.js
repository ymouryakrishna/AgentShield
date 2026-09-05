const crypto = require('crypto');

/**
 * Deterministically sorts JSON keys to produce canonical representation for SHA-256 hashing.
 */
function canonicalizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(item => canonicalizeObject(item)).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  const entries = keys.map(key => `"${key}":${canonicalizeObject(obj[key])}`);
  return `{${entries.join(',')}}`;
}

function generateSha256Hash(obj) {
  const canonicalString = canonicalizeObject(obj);
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

module.exports = {
  canonicalizeObject,
  generateSha256Hash,
};
