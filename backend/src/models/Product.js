class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.category = data.category || 'sports';
    this.listPrice = data.listPrice || data.price;
    this.price = this.listPrice;
    this.floorPrice = data.floorPrice;
    this.maxDiscountPercent = data.maxDiscountPercent || 12;
    this.maxNegotiationRounds = data.maxNegotiationRounds || 3;
    this.negotiable = data.negotiable !== false;
    this.stock = data.stock ?? 100;
    this.bundleRules = data.bundleRules || [];
    this.crossSellProducts = data.crossSellProducts || [];
    this.upsellProducts = data.upsellProducts || [];
    this.active = data.active !== false;
    this.imageUrl = data.imageUrl || '';
    this.attributes = data.attributes || {};
  }
}

module.exports = Product;
