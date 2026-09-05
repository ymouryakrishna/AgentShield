const test = require('node:test');
const assert = require('node:assert');
const AuditService = require('../src/services/audit.service');
const AuditLog = require('../src/models/AuditLog');

test('Append-Only Chronological Audit Log Suite', async (t) => {

  await t.test('Appends and queries audit events in chronological order', () => {
    const event = AuditService.log({
      agentId: 'agent_demo_legitimate',
      action: 'PAYMENT_AUTHORIZED',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: 'Authorized settlement at ₹2,299.',
    });

    assert.ok(event.eventId);
    assert.ok(event.timestamp);

    const list = AuditService.getEvents();
    assert.ok(list.length > 0);
    assert.strictEqual(list[0].eventId, event.eventId);
  });

  await t.test('Filters events by action and status', () => {
    const blockedEvents = AuditService.getEvents({ status: 'BLOCKED' });
    for (const e of blockedEvents) {
      assert.strictEqual(e.status, 'BLOCKED');
    }
  });

  await t.test('Validates AuditLog Mongoose schema for ATTACK_DETECTED, REQUEST_BLOCKED, RECEIPT_CREATED, PAYMENT_VERIFIED', async () => {
    const testActions = ['ATTACK_DETECTED', 'REQUEST_BLOCKED', 'RECEIPT_CREATED', 'PAYMENT_VERIFIED'];
    
    for (const action of testActions) {
      const doc = new AuditLog({
        eventId: `AUD-TEST-${action}`,
        action,
        status: action.includes('BLOCKED') || action.includes('ATTACK') ? 'BLOCKED' : 'SUCCESS',
        agentId: 'test-agent',
        reason: `Testing ${action} event schema persistence`,
        metadata: { testKey: 'testVal' },
      });

      const validationError = await doc.validate();
      assert.strictEqual(validationError, undefined, `Validation failed for action ${action}`);
      assert.strictEqual(doc.action, action);
      assert.ok(doc.timestamp instanceof Date);
    }
  });

  await t.test('getAuditLogs returns logs sorted by timestamp descending', async () => {
    const logs = await AuditService.getAuditLogs();
    assert.ok(Array.isArray(logs));
    assert.ok(logs.length > 0);

    for (let i = 0; i < logs.length - 1; i++) {
      const current = new Date(logs[i].timestamp).getTime();
      const next = new Date(logs[i + 1].timestamp).getTime();
      assert.ok(current >= next, `Audit logs not sorted descending at index ${i}`);
    }
  });

});
