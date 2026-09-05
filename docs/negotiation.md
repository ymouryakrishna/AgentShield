# AgentShield Bounded Negotiation & Bundling Engine

## 1. Negotiation Protocol Philosophy

In autonomous B2C/B2B commerce, AI agents negotiate on price and terms. Without deterministic boundaries, an AI agent could concede all merchant margin.

AgentShield solves this with **Bounded Margin Preservation**:
1. The merchant sets a **Policy Envelope**: `listPrice`, `floorPrice`, `maxDiscountPercent`, `maxNegotiationRounds`.
2. The AI negotiator operates **strictly within this envelope**.
3. If an offer reaches the envelope limit, the engine uses **value-add bundling** (e.g. Free Sports Socks) instead of additional cash discounts to protect margins while driving conversion.

---

## 2. Running Shoes Negotiation Scenario

| Step | Actor | Action | Price | Bundle | Policy & Margin Status |
|---|---|---|---|---|---|
| **Round 1** | Buyer Agent | Propose opening offer | ₹2,200 | None | Within floor ₹2,200 |
| **Round 1** | Merchant Engine | Margin-preserving counteroffer | ₹2,399 | None | 4.0% discount; preserves ₹199 margin |
| **Round 2** | Buyer Agent | Counteroffer | ₹2,250 | None | Above floor ₹2,200 |
| **Round 2** | Merchant Engine | Smart Bundle Concession | ₹2,299 | **Free Sports Socks** | 8.0% discount + gift; satisfies ₹2,299 bundle rule |
| **Round 3** | Buyer Agent | Accept offer | ₹2,299 | Sports Socks | Requires customer confirmation |
| **Consent** | Human Customer | Verify & Consent | ₹2,299 | Sports Socks | Policy token minted |

---

## 3. Bundling Service Rules

Bundling allows merchants to increase **Average Order Value (AOV)** and customer delight without price erosion.

```javascript
// Bundling Rule definition
{
  id: 'bundle-running-socks',
  freeGift: 'Sports Socks',
  freeGiftProductId: 'sports-socks',
  thresholdPrice: 2299,
  description: 'Complimentary high-traction sports socks on orders at or above ₹2,299'
}
```

When an offer is evaluated:
$$\text{IF } \text{proposedPrice} \ge \text{thresholdPrice} \implies \text{bundleGranted} = \text{"Sports Socks"}$$
$$\text{ELSE } \implies \text{bundleGranted} = \text{null}$$

---

## 4. Margin Protection Guarantee

The server-side policy engine enforces:
$$\text{finalPrice} \ge \text{floorPrice}$$
$$\text{discountPercent} \le \text{maxDiscountPercent}$$
$$\text{round} \le \text{maxNegotiationRounds}$$

Any attempt to force a settlement violating these bounds is rejected with `decision: BLOCK`.
