const test = require('node:test');
const assert = require('node:assert');
const PaymentService = require('../src/services/payment.service');
const AuthorizationService = require('../src/services/authorization.service');

test('Payment Security Gate & Razorpay / Mock Adapter Suite', async (t) => {

  await t.test('Creates payment order when valid policy authorization token is supplied', async () => {
    const { token } = AuthorizationService.issueToken({
      sessionId: 'sess_pay_test',
      agentId: 'agent_demo_legitimate',
      productId: 'running-shoes',
      authorizedAmount: 2299,
    });

    const order = await PaymentService.createOrder({
      sessionId: 'sess_pay_test',
      amountInRupees: 2299,
      policyAuthorizationToken: token,
    });

    assert.ok(order.orderId);
    assert.strictEqual(order.amountInRupees, 2299);
  });

  await t.test('Rejects payment order without policy authorization token (HTTP 403)', async () => {
    await assert.rejects(async () => {
      await PaymentService.createOrder({
        sessionId: 'sess_no_token',
        amountInRupees: 2299,
        policyAuthorizationToken: null,
      });
    }, (err) => {
      return err.status === 403 || err.code === 'PAYMENT_NOT_AUTHORIZED';
    });
  });

  await t.test('Rejects payment order with invalid signature token', async () => {
    await assert.rejects(async () => {
      await PaymentService.createOrder({
        sessionId: 'sess_bad_token',
        amountInRupees: 2299,
        policyAuthorizationToken: 'AUTH_TOKEN_invalidpayload.invalidsignature',
      });
    });
  });

  await t.test('Rejects payment order when amount mismatches authorization', async () => {
    const { token } = AuthorizationService.issueToken({
      sessionId: 'sess_mismatch',
      agentId: 'agent_demo_legitimate',
      productId: 'running-shoes',
      authorizedAmount: 2299,
    });

    await assert.rejects(async () => {
      await PaymentService.createOrder({
        sessionId: 'sess_mismatch',
        amountInRupees: 1999,
        policyAuthorizationToken: token,
      });
    }, (err) => {
      return err.code === 'AMOUNT_MISMATCH';
    });
  });

  await t.test('Verifies mock payment signature successfully', () => {
    const res = PaymentService.verifyPayment({
      orderId: 'order_mock_123',
      paymentId: 'pay_mock_123',
      signature: 'test_verified_signature',
    });

    assert.strictEqual(res.verified, true);
    assert.strictEqual(res.status, 'PAID');
  });

});
