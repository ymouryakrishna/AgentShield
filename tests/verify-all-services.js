/**
 * AgentShield Comprehensive System Verification Script
 * Validates complete end-to-end functionality across all subsystems.
 */

async function runVerification() {
  console.log(`========================================`);
  console.log(`AGENTSHIELD SYSTEM VERIFICATION`);
  console.log(`========================================\n`);

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name} -> ERROR: ${err.message}`);
      failed++;
    }
  }

  // 1. Health
  await check('Health', async () => {
    const res = await fetch('http://localhost:5000/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'HEALTHY') throw new Error('Unhealthy status');
  });

  // 2. Catalog
  await check('Catalog', async () => {
    const res = await fetch('http://localhost:5000/api/catalog');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.products || data.products.length < 5) throw new Error('Incomplete catalog');
  });

  // 3. AI Catalog
  await check('AI Catalog', async () => {
    const res = await fetch('http://localhost:5000/api/catalog/ai');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.merchant || !data.products) throw new Error('Invalid AI catalog schema');
  });

  // 4. Policies
  await check('Policies', async () => {
    const res = await fetch('http://localhost:5000/api/policies');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.productEnvelopes) throw new Error('Missing policy envelopes');
  });

  // 5. Agents
  await check('Agents', async () => {
    const res = await fetch('http://localhost:5000/api/agents');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.agents || data.agents.length < 2) throw new Error('Missing registered agents');
  });

  // 6. Firewall
  await check('Firewall', async () => {
    const res = await fetch('http://localhost:5000/api/firewall/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'agent_demo_legitimate',
        intent: 'NEGOTIATE',
        productId: 'running-shoes',
        proposedPrice: 2299,
        round: 2,
      })
    });
    const data = await res.json();
    if (!data.allowed || data.decision !== 'APPROVE') throw new Error('Firewall failed legitimate offer');
  });

  // 7. Negotiation
  let testSessionId;
  await check('Negotiation', async () => {
    const res = await fetch('http://localhost:5000/api/negotiations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'running-shoes',
        buyerAgentId: 'agent_demo_legitimate',
      })
    });
    const data = await res.json();
    if (!data.sessionId) throw new Error('Missing sessionId');
    testSessionId = data.sessionId;
  });

  // 8. Bundle
  await check('Bundle', async () => {
    // Round 1
    await fetch(`http://localhost:5000/api/negotiations/${testSessionId}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedPrice: 2200, intent: 'NEGOTIATE' })
    });
    // Round 2 (triggers bundle concession)
    const res2 = await fetch(`http://localhost:5000/api/negotiations/${testSessionId}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedPrice: 2250, intent: 'COUNTER_OFFER' })
    });
    const data = await res2.json();
    if (data.counterOffer?.bundleOffered !== 'Sports Socks') throw new Error('Bundle rule not triggered');
  });

  // 9. Consent
  let policyAuthToken;
  await check('Consent', async () => {
    const res = await fetch(`http://localhost:5000/api/negotiations/${testSessionId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finalPrice: 2299,
        customerConsent: true,
      })
    });
    const data = await res.json();
    if (!data.policyAuthorizationToken) throw new Error('Missing policy authorization token');
    policyAuthToken = data.policyAuthorizationToken;
  });

  // 10. Authorization
  await check('Authorization', async () => {
    if (!policyAuthToken) throw new Error('No authorization token available');
  });

  // 11. Payment
  let testOrderId;
  await check('Payment', async () => {
    const res = await fetch('http://localhost:5000/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: testSessionId,
        amountInRupees: 2299,
        policyAuthorizationToken: policyAuthToken,
      })
    });
    const data = await res.json();
    if (!data.order?.orderId) throw new Error('Failed to create payment order');
    testOrderId = data.order.orderId;
  });

  // 12. Receipt
  let testReceiptId;
  await check('Receipt', async () => {
    const res = await fetch('http://localhost:5000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        paymentId: 'pay_test_verify_script',
        signature: 'test_verified_signature',
        sessionId: testSessionId,
        amountInRupees: 2299,
      })
    });
    const data = await res.json();
    if (!data.receipt?.receiptId) throw new Error('Receipt generation failed');
    testReceiptId = data.receipt.receiptId;
  });

  // 13. SHA-256
  await check('SHA-256', async () => {
    const res = await fetch(`http://localhost:5000/api/receipts/${testReceiptId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status !== 'INTEGRITY_VERIFIED' || !data.isValid) throw new Error('SHA-256 seal verification failed');
  });

  // 14. Audit
  await check('Audit', async () => {
    const res = await fetch('http://localhost:5000/api/audit');
    const data = await res.json();
    if (!data.events || data.events.length < 5) throw new Error('Audit trail incomplete');
  });

  // 15. Metrics
  await check('Metrics', async () => {
    const res = await fetch('http://localhost:5000/api/metrics');
    const data = await res.json();
    if (typeof data.metrics?.aovUplift !== 'number') throw new Error('Invalid metrics');
  });

  // 16. Legitimate Demo
  await check('Legitimate Demo', async () => {
    const res = await fetch('http://localhost:5000/api/demo/legitimate', { method: 'POST' });
    const data = await res.json();
    if (!data.success || data.finalPrice !== 2299) throw new Error('Legitimate demo failed');
  });

  // 17. Adversarial Demo
  await check('Adversarial Demo', async () => {
    const res = await fetch('http://localhost:5000/api/demo/adversarial', { method: 'POST' });
    const data = await res.json();
    if (!data.blocked || data.decision !== 'BLOCK') throw new Error('Adversarial demo was not blocked');
  });

  // 18. Payment Bypass
  await check('Payment Bypass', async () => {
    const res = await fetch('http://localhost:5000/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountInRupees: 1,
        policyAuthorizationToken: null,
      })
    });
    if (res.status !== 403) throw new Error(`Expected HTTP 403, received ${res.status}`);
  });

  console.log(`\n========================================`);
  if (failed === 0) {
    console.log(`ALL TESTS PASSED (${passed}/${passed})`);
  } else {
    console.log(`FAILED (${failed} failed, ${passed} passed)`);
  }
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runVerification();
