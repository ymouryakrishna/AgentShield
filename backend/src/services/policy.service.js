const { db } = require('../config/database');
const { NotFoundError, AppError } = require('../utils/errors');

class PolicyService {
  static getPolicyForProduct(productId) {
    const policy = db.policies.get(productId);
    if (!policy) {
      throw new NotFoundError(`Merchant policy for product '${productId}' not found.`);
    }
    return policy;
  }

  static getAllPolicies() {
    const list = [];
    const seenIds = new Set();
    for (const [id, pol] of db.policies.entries()) {
      if (!seenIds.has(pol.productId)) {
        seenIds.add(pol.productId);
        list.push(pol);
      }
    }
    return list;
  }

  /**
   * Merchant updates policy envelope. AI agents cannot invoke this.
   */
  static updatePolicy(productId, updates) {
    const product = db.products.get(productId);
    if (!product) {
      throw new NotFoundError(`Product '${productId}' not found in catalog.`);
    }

    const policy = db.policies.get(productId) || {
      productId,
      productName: product.name,
      listPrice: product.listPrice,
    };

    if (updates.floorPrice !== undefined) {
      if (updates.floorPrice > product.listPrice) {
        throw new AppError('INVALID_FLOOR_PRICE', 'Floor price cannot exceed list price.', 400);
      }
      policy.floorPrice = Number(updates.floorPrice);
      product.floorPrice = Number(updates.floorPrice);
    }

    if (updates.maxDiscountPercent !== undefined) {
      policy.maxDiscountPercent = Number(updates.maxDiscountPercent);
      product.maxDiscountPercent = Number(updates.maxDiscountPercent);
    }

    if (updates.maxNegotiationRounds !== undefined) {
      policy.maxNegotiationRounds = Number(updates.maxNegotiationRounds);
      product.maxNegotiationRounds = Number(updates.maxNegotiationRounds);
    }

    if (updates.maxOrderValue !== undefined) {
      policy.maxOrderValue = Number(updates.maxOrderValue);
    }

    if (updates.negotiationEnabled !== undefined) {
      policy.negotiationEnabled = !!updates.negotiationEnabled;
      product.negotiable = !!updates.negotiationEnabled;
    }

    if (updates.bundleMinimumPrice !== undefined && product.bundleRules?.[0]) {
      product.bundleRules[0].thresholdPrice = Number(updates.bundleMinimumPrice);
      policy.bundleRules = product.bundleRules;
    }

    policy.updatedAt = new Date().toISOString();
    db.policies.set(productId, policy);
    db.products.set(productId, product);

    return policy;
  }
}

module.exports = PolicyService;
