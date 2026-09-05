class BundleService {
  /**
   * Evaluates product bundle eligibility for a given proposed price.
   * @param {object} product 
   * @param {number} proposedPrice 
   * @returns {{ eligible: boolean, freeGift: string|null, rule: object|null }}
   */
  static evaluateBundle(product, proposedPrice) {
    if (!product || !product.bundleRules || product.bundleRules.length === 0) {
      return { eligible: false, freeGift: null, rule: null };
    }

    for (const rule of product.bundleRules) {
      if (proposedPrice >= rule.thresholdPrice) {
        return {
          eligible: true,
          freeGift: rule.freeGift,
          rule,
        };
      }
    }

    return { eligible: false, freeGift: null, rule: null };
  }
}

module.exports = BundleService;
