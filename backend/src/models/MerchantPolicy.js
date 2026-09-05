class MerchantPolicy {
  constructor(data) {
    this.id = data.id || `pol-${data.productId}`;
    this.productId = data.productId;
    this.productName = data.productName;
    this.listPrice = data.listPrice;
    this.floorPrice = data.floorPrice;
    this.maxDiscountPercent = data.maxDiscountPercent || 12;
    this.maxNegotiationRounds = data.maxNegotiationRounds || 3;
    this.maxOrderValue = data.maxOrderValue || 50000;
    this.negotiationEnabled = data.negotiationEnabled !== false;
    this.promptInjectionProtection = data.promptInjectionProtection !== false;
    this.bundleRules = data.bundleRules || [];
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = MerchantPolicy;
