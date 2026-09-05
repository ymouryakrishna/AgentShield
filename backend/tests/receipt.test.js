const test = require('node:test');
const assert = require('node:assert');
const ReceiptService = require('../src/services/receipt.service');
const { generateSha256Hash } = require('../src/utils/canonicalJson');

test('Negotiation Receipt & Cryptographic SHA-256 Seal Suite', async (t) => {

  const dummySession = {
    sessionId: 'sess_receipt_test',
    agentId: 'agent_demo_legitimate',
    productId: 'running-shoes',
    listPrice: 2499,
    floorPrice: 2200,
    round: 3,
    bundle: 'Sports Socks',
    customerConsent: true,
    offers: [
      { round: 1, actor: 'BUYER_AGENT', proposedPrice: 2100 },
      { round: 2, actor: 'MERCHANT_AGENT', proposedPrice: 2299, bundleOffered: 'Sports Socks' },
      { round: 3, actor: 'BUYER_AGENT', proposedPrice: 2299 },
    ],
  };

  await t.test('Generates 64-character SHA-256 seal on receipt creation', () => {
    const receipt = ReceiptService.generateReceipt({
      session: dummySession,
      orderId: 'order_test_123',
      paymentId: 'pay_test_123',
      finalPrice: 2299,
    });

    assert.ok(receipt.receiptHash);
    assert.strictEqual(receipt.receiptHash.length, 64);

    const verification = ReceiptService.verifyIntegrity(receipt);
    assert.strictEqual(verification.isValid, true);
    assert.strictEqual(verification.status, 'INTEGRITY_VERIFIED');
  });

  await t.test('Detects tampering if price is modified', () => {
    const receipt = ReceiptService.generateReceipt({
      session: dummySession,
      orderId: 'order_test_456',
      paymentId: 'pay_test_456',
      finalPrice: 2299,
    });

    const tamperedReceipt = { ...receipt, finalPrice: 1999 };
    const verification = ReceiptService.verifyIntegrity(tamperedReceipt);

    assert.strictEqual(verification.isValid, false);
    assert.strictEqual(verification.status, 'INTEGRITY_FAILED');
  });

  await t.test('Detects tampering if bundle is modified', () => {
    const receipt = ReceiptService.generateReceipt({
      session: dummySession,
      orderId: 'order_test_789',
      paymentId: 'pay_test_789',
      finalPrice: 2299,
    });

    const tamperedReceipt = { ...receipt, bundle: 'Gold Watch' };
    const verification = ReceiptService.verifyIntegrity(tamperedReceipt);

    assert.strictEqual(verification.isValid, false);
    assert.strictEqual(verification.status, 'INTEGRITY_FAILED');
  });

});
