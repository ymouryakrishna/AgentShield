class Agent {
  constructor(data) {
    this.agentId = data.agentId;
    this.name = data.name || data.agentId;
    this.status = data.status || 'ACTIVE';
    this.whitelisted = data.whitelisted !== false;
    this.type = data.type || 'LEGITIMATE';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Agent;
