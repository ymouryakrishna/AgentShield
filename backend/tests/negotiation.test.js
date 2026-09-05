const test = require('node:test');
const assert = require('node:assert');
const NegotiationService = require('../src/services/negotiation.service');

test('Bounded Negotiation Engine Suite', async (t) => {

  await t.test('Round 1: Proposes counteroffer within margin bounds (Buyer ₹2,200 -> Merchant ₹2,399)', () => {
    const session = NegotiationService.createSession({ productId: 'running-shoes' });
    const res = NegotiationService.processOffer(session.sessionId, { proposedPrice: 2200 });

    assert.strictEqual(res.status, 'COUNTERED');
    assert.strictEqual(res.session.round, 1);
    assert.strictEqual(res.counterOffer.proposedPrice, 2399);
  });

  await t.test('Round 2: Activates smart bundle concession rule at ₹2,299 (Buyer ₹2,250 -> Merchant ₹2,299 + Socks)', () => {
    const session = NegotiationService.createSession({ productId: 'running-shoes' });
    NegotiationService.processOffer(session.sessionId, { proposedPrice: 2200 });
    const res2 = NegotiationService.processOffer(session.sessionId, { proposedPrice: 2250 });

    assert.strictEqual(res2.status, 'COUNTERED');
    assert.strictEqual(res2.session.round, 2);
    assert.strictEqual(res2.counterOffer.proposedPrice, 2299);
    assert.strictEqual(res2.counterOffer.bundleOffered, 'Sports Socks');
  });

  await t.test('Settlement: Accepts agreement at ₹2,299', () => {
    const session = NegotiationService.createSession({ productId: 'running-shoes' });
    NegotiationService.processOffer(session.sessionId, { proposedPrice: 2200 });
    NegotiationService.processOffer(session.sessionId, { proposedPrice: 2250 });
    const res3 = NegotiationService.processOffer(session.sessionId, {
      proposedPrice: 2299,
      intent: 'ACCEPT_OFFER',
      customerConsent: true,
    });

    assert.strictEqual(res3.status, 'SETTLED');
    assert.strictEqual(res3.session.finalPrice, 2299);
    assert.strictEqual(res3.session.bundle, 'Sports Socks');
  });

  await t.test('Strictly prevents settling below floor price ₹2,200', () => {
    const session = NegotiationService.createSession({ productId: 'running-shoes' });
    const res = NegotiationService.processOffer(session.sessionId, { proposedPrice: 1999 });

    assert.strictEqual(res.status, 'BLOCKED');
    assert.strictEqual(res.decision, 'BLOCK');
    assert.ok(res.firewallEvaluation.failedChecks.includes('PRICE_BELOW_FLOOR'));
  });

});
