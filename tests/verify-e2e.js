const assert = require('node:assert');

async function testAllRoutes() {
  console.log('🌐 Testing all AgentShield endpoints on http://localhost:3000...\n');
  const baseUrl = 'http://localhost:3000';

  // 1. Check Root Page
  const rootRes = await fetch(`${baseUrl}/`);
  assert.strictEqual(rootRes.status, 200);
  const rootHtml = await rootRes.text();
  assert.ok(rootHtml.includes('AgentShield'));
  console.log('✓ Route 1: Overview Dashboard (/) loaded [HTTP 200]');

  // 2. Check Demo Center Page
  const demoRes = await fetch(`${baseUrl}/demo`);
  assert.strictEqual(demoRes.status, 200);
  console.log('✓ Route 2: Demo Center (/demo) loaded [HTTP 200]');

  // 3. Check Live Negotiation Page
  const negRes = await fetch(`${baseUrl}/negotiate`);
  assert.strictEqual(negRes.status, 200);
  console.log('✓ Route 3: Live Negotiation (/negotiate) loaded [HTTP 200]');

  // 4. Check Commerce Firewall Page
  const fwRes = await fetch(`${baseUrl}/firewall`);
  assert.strictEqual(fwRes.status, 200);
  console.log('✓ Route 4: Commerce Firewall (/firewall) loaded [HTTP 200]');

  // 5. Check Receipts Hub Page
  const rcptRes = await fetch(`${baseUrl}/receipts`);
  assert.strictEqual(rcptRes.status, 200);
  console.log('✓ Route 5: Receipts Hub (/receipts) loaded [HTTP 200]');

  // 6. Check Audit Trail Page
  const auditPageRes = await fetch(`${baseUrl}/audit`);
  assert.strictEqual(auditPageRes.status, 200);
  console.log('✓ Route 6: Audit Trail (/audit) loaded [HTTP 200]');

  // 7. Check AI Catalog Page & JSON endpoint
  const catPageRes = await fetch(`${baseUrl}/catalog`);
  assert.strictEqual(catPageRes.status, 200);
  console.log('✓ Route 7: Catalog (/catalog) loaded [HTTP 200]');

  const aiCatRes = await fetch(`${baseUrl}/api/catalog/ai`);
  assert.strictEqual(aiCatRes.status, 200);
  const aiCatJson = await aiCatRes.json();
  assert.strictEqual(aiCatJson.merchant.currency, 'INR');
  assert.ok(aiCatJson.catalog.length >= 5);
  console.log('✓ Route 8: AI-Readable Catalog API (/api/catalog/ai) loaded [HTTP 200]');

  // 8. Test Dynamic Metrics API
  const metricsRes = await fetch(`${baseUrl}/api/metrics`);
  assert.strictEqual(metricsRes.status, 200);
  const metricsJson = await metricsRes.json();
  assert.ok(metricsJson.metrics.totalRevenue > 0);
  assert.ok(metricsJson.metrics.aovUpliftPercent > 0);
  console.log(`✓ Route 9: Real-Time Dynamic Metrics (/api/metrics) -> AOV Uplift: +${metricsJson.metrics.aovUpliftPercent}% [HTTP 200]`);

  // 9. Test 1-Click Legitimate Buyer Demo Endpoint
  console.log('\n--- Testing 1-Click Legitimate Buyer Flow ---');
  const demoLegitRes = await fetch(`${baseUrl}/api/demo/legitimate`, { method: 'POST' });
  assert.strictEqual(demoLegitRes.status, 200);
  const demoLegitData = await demoLegitRes.json();
  assert.strictEqual(demoLegitData.success, true);
  assert.strictEqual(demoLegitData.receipt.negotiation.finalAgreedPrice, 2299);
  assert.strictEqual(demoLegitData.receipt.negotiation.bundleGranted, 'Pro Cushion Sports Socks (Pair)');
  assert.strictEqual(demoLegitData.receipt.integrity.algorithm, 'SHA-256');
  assert.strictEqual(demoLegitData.receipt.integrity.canonicalHash.length, 64);
  console.log(`✓ Route 10: Demo Legitimate Buyer Settled at ₹2,299 + Socks (Receipt: ${demoLegitData.receipt.receiptId}, Hash: ${demoLegitData.receipt.integrity.canonicalHash.substring(0, 16)}...) [HTTP 200]`);

  // 10. Test Individual Receipt Details & Cryptographic Verification API
  const receiptVerifyRes = await fetch(`${baseUrl}/api/receipts/${demoLegitData.receipt.receiptId}`);
  assert.strictEqual(receiptVerifyRes.status, 200);
  const receiptVerifyData = await receiptVerifyRes.json();
  assert.strictEqual(receiptVerifyData.integrityCheck.isValid, true);
  console.log(`✓ Route 11: Cryptographic Receipt Integrity API (/api/receipts/${demoLegitData.receipt.receiptId}) -> Valid: ${receiptVerifyData.integrityCheck.isValid} [HTTP 200]`);

  // 11. Test 1-Click Adversarial Agent Attack Demo Endpoint
  console.log('\n--- Testing 1-Click Adversarial Agent Attack Flow ---');
  const demoAdvRes = await fetch(`${baseUrl}/api/demo/adversarial`, { method: 'POST' });
  assert.strictEqual(demoAdvRes.status, 200);
  const demoAdvData = await demoAdvRes.json();
  assert.strictEqual(demoAdvData.blocked, true);
  assert.strictEqual(demoAdvData.paymentBlocked, true);
  assert.ok(demoAdvData.firewallEvaluation.violations.includes('CHECK_5_PRICE_BOUNDARY'));
  assert.ok(demoAdvData.firewallEvaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT'));
  assert.strictEqual(demoAdvData.firewallEvaluation.decision, 'BLOCK');
  console.log(`✓ Route 12: Adversarial Attack (₹1 settle) Intercepted & Blocked: ${demoAdvData.reason} [HTTP 200]`);

  // 12. Test Audit Trail API includes both legitimate and adversarial records
  const auditRes = await fetch(`${baseUrl}/api/audit`);
  assert.strictEqual(auditRes.status, 200);
  const auditJson = await auditRes.json();
  assert.ok(auditJson.events.some(e => e.result === 'BLOCKED'));
  assert.ok(auditJson.events.some(e => e.action === 'PAYMENT_SUCCESS'));
  console.log(`✓ Route 13: Audit Trail API contains ${auditJson.count} chronological security and commerce events [HTTP 200]`);

  console.log('\n======================================================');
  console.log('🚀 ALL 13 END-TO-END HTTP ROUTES AND INTEGRATIONS PASSED!');
  console.log('======================================================\n');
}

testAllRoutes().catch(err => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});
