class ExplainabilityService {
  /**
   * Generates deterministic natural-language explanation derived strictly from structured decision facts.
   * Zero LLM hallucination.
   * @param {object} facts 
   * @returns {string}
   */
  static generateExplanation(facts) {
    const {
      decision,
      proposedPrice,
      floorPrice,
      discountPercent,
      maxDiscountPercent,
      round,
      maxRounds,
      bundleAllowed,
      bundleGranted,
      customerConsent,
      checksFailed = [],
      overrideDetected,
      overridePatterns,
    } = facts;

    if (decision === 'BLOCK') {
      const reasons = [];

      if (proposedPrice < floorPrice) {
        reasons.push(`the requested price of ₹${Number(proposedPrice).toLocaleString('en-IN')} is below the merchant floor of ₹${Number(floorPrice).toLocaleString('en-IN')}`);
      }

      if (overrideDetected) {
        const patternText = overridePatterns && overridePatterns.length > 0 
          ? ` (${overridePatterns.join(', ')})`
          : '';
        reasons.push(`a policy override attempt${patternText} was detected`);
      }

      if (discountPercent > maxDiscountPercent) {
        reasons.push(`the requested discount of ${Number(discountPercent).toFixed(1)}% exceeds the permitted limit of ${Number(maxDiscountPercent).toFixed(1)}%`);
      }

      if (round > maxRounds) {
        reasons.push(`negotiation round (${round}) exceeded the maximum permitted rounds (${maxRounds})`);
      }

      if (checksFailed.includes('AGENT_NOT_AUTHORIZED')) {
        reasons.push('the calling AI agent entity is not authorized or active');
      }

      if (checksFailed.includes('PRODUCT_NOT_ALLOWED')) {
        reasons.push('the requested product is not active or not available for autonomous negotiation');
      }

      if (checksFailed.includes('RATE_LIMIT_EXCEEDED')) {
        reasons.push('the calling agent exceeded permitted request rate limits');
      }

      if (checksFailed.includes('ORDER_VALUE_LIMIT_EXCEEDED')) {
        reasons.push('the gross order value exceeds merchant risk boundary limits');
      }

      if (checksFailed.includes('CONSENT_REQUIRED')) {
        reasons.push('customer explicit consent is mandatory prior to financial checkout');
      }

      if (reasons.length === 0) {
        reasons.push('the request violated deterministic merchant commerce policies');
      }

      return `Blocked because ${reasons.join(' and ')}. Payment authorization was not granted.`;
    }

    if (decision === 'SETTLE' || decision === 'APPROVE') {
      const parts = [
        `the final price of ₹${Number(proposedPrice).toLocaleString('en-IN')} is above the merchant's ₹${Number(floorPrice).toLocaleString('en-IN')} floor`,
        `the discount is within the allowed ${Number(maxDiscountPercent).toFixed(1)}% limit`,
        `the negotiation remained within ${round} of ${maxRounds} allowed rounds`,
      ];

      if (bundleGranted) {
        parts.push(`the bundle condition was satisfied (${bundleGranted})`);
      }

      if (customerConsent) {
        parts.push('customer confirmation was received');
      }

      return `Approved because ${parts.join(', ')}.`;
    }

    if (decision === 'COUNTER') {
      let msg = `Counteroffer proposed: ₹${Number(proposedPrice).toLocaleString('en-IN')} (${Number(discountPercent).toFixed(1)}% discount, round ${round}/${maxRounds}).`;
      if (bundleGranted) {
        msg += ` Includes bundled gift: ${bundleGranted}.`;
      }
      return msg;
    }

    return 'Decision evaluated deterministically under merchant policy bounds.';
  }
}

module.exports = ExplainabilityService;
