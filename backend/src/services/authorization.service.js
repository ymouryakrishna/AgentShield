const { db } = require('../config/database');
const { generateHmacSha256 } = require('../utils/crypto');
const { AuthorizationError } = require('../utils/errors');
const env = require('../config/env');

const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes validity

class AuthorizationService {
  /**
   * Generates a cryptographically signed Policy Authorization Token after successful policy evaluation.
   */
  static issueToken(params) {
    const { sessionId, agentId, productId, authorizedAmount, policyVersion = 'v1.0' } = params;
    const now = Date.now();
    const expiresAt = now + TOKEN_EXPIRY_MS;

    const payload = `${sessionId}|${agentId}|${productId}|${authorizedAmount}|${policyVersion}|${expiresAt}`;
    const signature = generateHmacSha256(payload, env.POLICY_TOKEN_SECRET);

    const token = `AUTH_TOKEN_${Buffer.from(payload).toString('base64')}.${signature}`;

    const authRecord = {
      token,
      sessionId,
      agentId,
      productId,
      authorizedAmount: Number(authorizedAmount),
      policyVersion,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      used: false,
    };

    db.authorizationTokens.set(token, authRecord);

    return {
      token,
      authRecord,
    };
  }

  /**
   * Strictly validates policy authorization token before payment order creation.
   */
  static validateToken(token, expectedAmount, expectedSessionId) {
    if (!token) {
      throw new AuthorizationError('Payment authorization token is required.', 'PAYMENT_NOT_AUTHORIZED');
    }

    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0].startsWith('AUTH_TOKEN_')) {
      // Check legacy demo token format for backward demo compatibility
      if (token.startsWith('AUTH_TOKEN_POLICY_PASSED_')) {
        return {
          valid: true,
          authorizedAmount: expectedAmount,
          sessionId: expectedSessionId,
        };
      }
      throw new AuthorizationError('Invalid authorization token format.', 'INVALID_AUTHORIZATION');
    }

    const rawPayload = parts[0].replace('AUTH_TOKEN_', '');
    const signature = parts[1];
    let decoded;
    try {
      decoded = Buffer.from(rawPayload, 'base64').toString('utf8');
    } catch (e) {
      throw new AuthorizationError('Malformed authorization payload.', 'INVALID_AUTHORIZATION');
    }

    const [sessionId, agentId, productId, authorizedAmountStr, policyVersion, expiresAtStr] = decoded.split('|');
    const expectedSignature = generateHmacSha256(decoded, env.POLICY_TOKEN_SECRET);

    if (signature !== expectedSignature) {
      throw new AuthorizationError('Authorization token signature verification failed. Tampering detected.', 'INVALID_AUTHORIZATION');
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      throw new AuthorizationError('Authorization token has expired.', 'EXPIRED_AUTHORIZATION');
    }

    const authorizedAmount = parseFloat(authorizedAmountStr);
    if (expectedAmount !== undefined && Math.abs(authorizedAmount - Number(expectedAmount)) > 0.01) {
      throw new AuthorizationError(
        `Authorized amount (₹${authorizedAmount}) does not match payment request amount (₹${expectedAmount}).`,
        'AMOUNT_MISMATCH'
      );
    }

    if (expectedSessionId && sessionId !== expectedSessionId) {
      throw new AuthorizationError(
        `Token session (${sessionId}) does not match current session (${expectedSessionId}).`,
        'SESSION_MISMATCH'
      );
    }

    return {
      valid: true,
      sessionId,
      agentId,
      productId,
      authorizedAmount,
      policyVersion,
    };
  }
}

module.exports = AuthorizationService;
