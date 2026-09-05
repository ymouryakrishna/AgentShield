/**
 * Deterministic Explainable Decision Engine
 * Maps structured decision facts to unambiguous plain-English explanations.
 */

function generateStructuredExplanation(facts) {
  const {
    decision,
    proposedPrice,
    floorPrice,
    discountPercent,
    maxDiscountPercent,
    round,
    maxRounds,
    giftAllowed,
    giftGranted,
    buyerConfirmed,
    checksFailed = [],
    overrideDetected,
    overridePatterns
  } = facts;

  if (decision === 'BLOCK') {
    const reasons = [];

    if (overrideDetected) {
      const patternText = overridePatterns && overridePatterns.length > 0 
        ? ` (${overridePatterns.join(', ')})`
        : '';
      reasons.push(`a policy override attempt${patternText} was detected`);
    }

    if (proposedPrice < floorPrice) {
      reasons.push(`requested price ₹${Number(proposedPrice).toLocaleString('en-IN')} is below the merchant floor of ₹${Number(floorPrice).toLocaleString('en-IN')}`);
    }

    if (discountPercent > maxDiscountPercent) {
      reasons.push(`requested discount of ${Number(discountPercent).toFixed(1)}% exceeds the merchant maximum of ${Number(maxDiscountPercent).toFixed(1)}%`);
    }

    if (round > maxRounds) {
      reasons.push(`negotiation round (${round}) exceeded the maximum permitted rounds (${maxRounds})`);
    }

    if (checksFailed.includes('CHECK_1_AGENT_IDENTITY')) {
      reasons.push('the calling AI agent identity is not authorized');
    }

    if (checksFailed.includes('CHECK_2_PRODUCT_PERMISSION')) {
      reasons.push('product is not available for automated negotiation');
    }

    if (checksFailed.includes('CHECK_3_RATE_LIMIT')) {
      reasons.push('rate limit exceeded for this agent');
    }

    if (checksFailed.includes('CHECK_9_ORDER_VALUE')) {
      reasons.push('order value exceeds merchant policy limits');
    }

    if (reasons.length === 0) {
      reasons.push('the request violated one or more merchant commerce policies');
    }

    return `Blocked because ${reasons.join(', and ')}.`;
  }

  if (decision === 'SETTLE' || decision === 'APPROVE') {
    const approvals = [
      `₹${Number(proposedPrice).toLocaleString('en-IN')} is above the merchant's ₹${Number(floorPrice).toLocaleString('en-IN')} floor`,
      `the ${Number(discountPercent).toFixed(1)}% discount is within the allowed ${Number(maxDiscountPercent).toFixed(1)}% limit`,
      `the negotiation remained within ${round} of ${maxRounds} allowed rounds`,
    ];

    if (giftGranted && giftAllowed) {
      approvals.push(`the order qualified for complimentary bundle gift (${giftGranted})`);
    }

    if (buyerConfirmed) {
      approvals.push('the buyer explicitly confirmed the settlement');
    }

    return `Approved because ${approvals.join(', ')}.`;
  }

  if (decision === 'COUNTER') {
    let msg = `Counteroffer proposed: ₹${Number(proposedPrice).toLocaleString('en-IN')} (${Number(discountPercent).toFixed(1)}% discount, round ${round}/${maxRounds}).`;
    if (giftGranted) {
      msg += ` Includes bundled gift: ${giftGranted}.`;
    }
    return msg;
  }

  return 'Decision evaluated under merchant policy bounds.';
}

module.exports = {
  generateStructuredExplanation,
};
