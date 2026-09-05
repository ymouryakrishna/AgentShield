const test = require('node:test');
const assert = require('node:assert');
const MetricsService = require('../src/services/metrics.service');

test('Dynamic Metrics & Real-Time AOV Uplift Suite', async (t) => {

  await t.test('Calculates database-derived AOV and positive uplift', () => {
    const metrics = MetricsService.getMetrics();

    assert.ok(typeof metrics.baselineAOV === 'number');
    assert.ok(typeof metrics.negotiatedAOV === 'number');
    assert.ok(typeof metrics.aovUplift === 'number');
    assert.ok(metrics.negotiatedOrders > 0);
    assert.ok(metrics.totalOrders >= metrics.negotiatedOrders);

    // Verify formula: AOV Uplift = ((negotiatedAOV - baselineAOV) / baselineAOV) * 100
    const calculatedUplift = Number((((metrics.negotiatedAOV - metrics.baselineAOV) / metrics.baselineAOV) * 100).toFixed(1));
    assert.strictEqual(metrics.aovUplift, calculatedUplift);
  });

});
