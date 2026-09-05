class AuditEvent {
  constructor(data) {
    this.eventId = data.eventId || data.id || `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    this.id = this.eventId;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.agentId = data.agentId || data.actor || 'SYSTEM';
    this.actor = this.agentId;
    this.sessionId = data.sessionId || data.relatedSessionId || null;
    this.relatedSessionId = this.sessionId;
    this.action = data.action; // AGENT_REQUEST, FIREWALL_EVALUATION, POLICY_EVALUATION, OFFER_CREATED, COUNTER_OFFER, SETTLEMENT, CONSENT_RECEIVED, PAYMENT_AUTHORIZED, PAYMENT_CREATED, PAYMENT_VERIFIED, RECEIPT_CREATED, ATTACK_DETECTED, REQUEST_BLOCKED
    this.status = data.status || data.result || 'INFO'; // SUCCESS, BLOCKED, WARNING, INFO
    this.result = this.status;
    this.decision = data.decision || (this.status === 'BLOCKED' ? 'BLOCK' : 'ALLOW');
    this.reason = data.reason || '';
    this.metadata = data.metadata || {};
    this.requestId = data.requestId || null;
  }
}

module.exports = AuditEvent;
