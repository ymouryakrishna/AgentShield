class NegotiationSession {
  constructor(data) {
    this.sessionId = data.sessionId || data.id || `NGS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    this.id = this.sessionId;
    this.agentId = data.agentId || data.buyerAgentId;
    this.agentName = data.agentName || data.buyerAgentName;
    this.productId = data.productId;
    this.status = data.status || 'ACTIVE'; // ACTIVE | SETTLED | BLOCKED | ABANDONED
    this.round = data.round || data.currentRound || 0;
    this.maxRounds = data.maxRounds || data.maxNegotiationRounds || 3;
    this.listPrice = data.listPrice || data.listedPrice;
    this.floorPrice = data.floorPrice;
    this.offers = data.offers || [];
    this.counterOffers = data.counterOffers || [];
    this.finalPrice = data.finalPrice || null;
    this.bundle = data.bundle || data.finalBundle || null;
    this.customerConsent = data.customerConsent || data.buyerConfirmed || false;
    this.policyVersion = data.policyVersion || 'v1.0';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = NegotiationSession;
