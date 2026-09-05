const test = require('node:test');
const assert = require('node:assert');
const PolicyService = require('../src/services/policy.service');

test('Merchant Policy Engine Suite', async (t) => {

  await t.test('Fetches policy envelope for valid product', () => {
    const pol = PolicyService.getPolicyForProduct('running-shoes');
    assert.strictEqual(pol.floorPrice, 2200);
    assert.strictEqual(pol.maxDiscountPercent, 12);
  });

  await t.test('Merchant can safely update policy envelope', () => {
    const updated = PolicyService.updatePolicy('running-shoes', {
      maxDiscountPercent: 12.5,
    });
    assert.strictEqual(updated.maxDiscountPercent, 12.5);
    // Reset back
    PolicyService.updatePolicy('running-shoes', { maxDiscountPercent: 12 });
  });

  await t.test('Rejects invalid floor price exceeding list price', () => {
    assert.throws(() => {
      PolicyService.updatePolicy('running-shoes', { floorPrice: 3000 });
    });
  });

});
