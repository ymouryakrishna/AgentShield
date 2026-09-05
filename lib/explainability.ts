import { DecisionFacts } from './types';

/**
 * Deterministic Explainable Decision Engine
 * 
 * Takes structured policy facts and builds human-readable, unambiguous explanations.
 * CRITICAL: The explanation is generated strictly from structured facts.
 * Never allows an LLM to invent or hallucinate the reason.
 */

export function generateStructuredExplanation(facts: DecisionFacts): string {
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
    checksFailed,
    overrideDetected,
    overridePatterns
  } = facts;

  if (decision === 'BLOCK') {
    const reasons: string[] = [];

    if (overrideDetected) {
      const patternText = overridePatterns && overridePatterns.length > 0 
        ? ` (${overridePatterns.join(', ')})`
        : '';
      reasons.push(`a policy override attempt${patternText} was detected`);
    }

    if (proposedPrice < floorPrice) {
      reasons.push(`requested price ₹${proposedPrice.toLocaleString('en-IN')} is below the merchant floor of ₹${floorPrice.toLocaleString('en-IN')}`);
    }

    if (discountPercent > maxDiscountPercent) {
      reasons.push(`requested discount of ${discountPercent.toFixed(1)}% exceeds the merchant maximum of ${maxDiscountPercent.toFixed(1)}%`);
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

    // Capitalize first reason
    const joinedReasons = reasons.join(', and ');
    return `Blocked because ${joinedReasons}.`;
  }

  if (decision === 'SETTLE' || decision === 'APPROVE') {
    const approvals: string[] = [
      `₹${proposedPrice.toLocaleString('en-IN')} is above the merchant's ₹${floorPrice.toLocaleString('en-IN')} floor`,
      `the ${discountPercent.toFixed(1)}% discount is within the allowed ${maxDiscountPercent.toFixed(1)}% limit`,
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
    let msg = `Counteroffer proposed: ₹${proposedPrice.toLocaleString('en-IN')} (${discountPercent.toFixed(1)}% discount, round ${round}/${maxRounds}).`;
    if (giftGranted) {
      msg += ` Includes bundled gift: ${giftGranted}.`;
    }
    return msg;
  }

  return `Decision evaluated under merchant policy bounds.`;
}

export function formatBulletPointsExplanation(facts: DecisionFacts): Array<{ passed: boolean; text: string }> {
  const points: Array<{ passed: boolean; text: string }> = [];

  // Floor Price Check
  const priceOk = facts.proposedPrice >= facts.floorPrice;
  points.push({
    passed: priceOk,
    text: priceOk
      ? `Proposed price (₹${facts.proposedPrice.toLocaleString('en-IN')}) is $\\ge$ merchant floor (₹${facts.floorPrice.toLocaleString('en-IN')})`
      : `Proposed price (₹${facts.proposedPrice.toLocaleString('en-IN')}) is below merchant floor (₹${facts.floorPrice.toLocaleString('en-IN')})`
  });

  // Discount Check
  const discountOk = facts.discountPercent <= facts.maxDiscountPercent + 0.01;
  points.push({
    passed: discountOk,
    text: discountOk
      ? `Discount (${facts.discountPercent.toFixed(1)}%) is within max limit (${facts.maxDiscountPercent.toFixed(1)}%)`
      : `Discount (${facts.discountPercent.toFixed(1)}%) exceeds limit (${facts.maxDiscountPercent.toFixed(1)}%)`
  });

  // Round limit
  const roundOk = facts.round <= facts.maxRounds;
  points.push({
    passed: roundOk,
    text: roundOk
      ? `Negotiation round (${facts.round}/${facts.maxRounds}) within permitted limit`
      : `Exceeded maximum rounds (${facts.round} > ${facts.maxRounds})`
  });

  // Prompt Injection
  points.push({
    passed: !facts.overrideDetected,
    text: !facts.overrideDetected
      ? 'No prompt injection or merchant policy override detected'
      : `Policy override attempt detected: ${facts.overridePatterns?.join(', ') || 'Adversarial manipulation'}`
  });

  // Bundle
  if (facts.giftGranted) {
    points.push({
      passed: facts.giftAllowed,
      text: facts.giftAllowed
        ? `Complimentary bundle grant verified: ${facts.giftGranted}`
        : `Bundle grant not permitted at current price tier`
    });
  }

  // Buyer confirmation
  if (facts.decision === 'SETTLE' || facts.decision === 'APPROVE') {
    points.push({
      passed: facts.buyerConfirmed,
      text: facts.buyerConfirmed
        ? 'Buyer explicit consent and confirmation confirmed'
        : 'Awaiting buyer explicit confirmation'
    });
  }

  return points;
}
