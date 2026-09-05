const test = require('node:test');
const assert = require('node:assert');
const AuthorizationService = require('../src/services/authorization.service');

test('Policy Authorization Token Security Suite', async (t) => {

  await t.test('Issues valid signed authorization token', () => {
    const { token, authRecord } = AuthorizationService.issueToken({
      sessionId: 'sess_123',
      agentId: 'agent_demo_legitimate',
      productId: 'running-shoes',
      authorizedAmount: 2299,
    });

    assert.ok(token.startsWith('AUTH_TOKEN_'));
    assert.strictEqual(authRecord.authorizedAmount, 2299);

    const validation = AuthorizationService.validateToken(token, 2299, 'sess_123');
    assert.strictEqual(validation.valid, true);
  });

  await t.test('Rejects tampered authorization token signature', () => {
    const { token } = AuthorizationService.issueToken({
      sessionId: 'sess_123',
      agentId: 'agent_demo_legitimate',
      productId: 'running-shoes',
      authorizedAmount: 2299,
    });

    const tamperedToken = token.slice(0, -4) + 'abcd';
    assert.throws(() => {
      AuthorizationService.validateToken(tamperedToken, 2299, 'sess_123');
    });
  });

  await t.test('Rejects authorization token on amount mismatch', () => {
    const { token } = AuthorizationService.issueToken({
      sessionId: 'sess_123',
      agentId: 'agent_demo_legitimate',
      productId: 'running-shoes',
      authorizedAmount: 2299,
    });

    assert.throws(() => {
      AuthorizationService.validateToken(token, 1999, 'sess_123');
    });
  });

});
