# AgentShield Receipt Integrity & Canonical SHA-256 Hashing

## 1. Why Canonical Receipts are Required

In agentic commerce, multiple AI agents transact asynchronously. Without tamper-evident cryptographic receipts:
- A malicious buyer agent could claim a lower price was agreed upon.
- A rogue seller agent could dispute a granted bundle.
- Third-party dispute resolution systems would have no cryptographic proof of the negotiation history.

AgentShield solves this by generating a **Canonical Negotiation Receipt** sealed with **SHA-256**.

---

## 2. Canonicalization Algorithm

To ensure the hash is identical regardless of object key insertion order, whitespace, or serializer variations:

1. **Sort all keys lexicographically** at every depth.
2. **Exclude the receiptHash and integrity fields** from the hashing input.
3. **Format numbers deterministically** (no trailing zeroes variance).
4. **Produce compact JSON** without insignificant whitespace.
5. **Feed canonical JSON UTF-8 bytes into SHA-256 digest engine**.

```javascript
function canonicalizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeObject(item)).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    return JSON.stringify(key) + ':' + canonicalizeObject(obj[key]);
  });
  return '{' + pairs.join(',') + '}';
}
```

---

## 3. Receipt Structure Example

```json
{
  "receiptId": "NGR-2026-0001",
  "timestamp": "2026-08-31T10:31:26.110Z",
  "agentId": "agent_demo_legitimate",
  "sessionId": "NGS-DEMO-2026",
  "product": {
    "id": "running-shoes",
    "name": "Running Shoes",
    "category": "sports"
  },
  "listPrice": 2499,
  "floorPrice": 2200,
  "finalPrice": 2299,
  "discountPercent": 8.0,
  "maxDiscountPercent": 12.0,
  "negotiationRounds": 3,
  "offerHistory": [
    { "round": 1, "actor": "BUYER_AGENT", "price": 2200, "bundle": null },
    { "round": 1, "actor": "MERCHANT_AGENT", "price": 2399, "bundle": null },
    { "round": 2, "actor": "BUYER_AGENT", "price": 2250, "bundle": null },
    { "round": 2, "actor": "MERCHANT_AGENT", "price": 2299, "bundle": "Sports Socks" },
    { "round": 3, "actor": "BUYER_AGENT", "price": 2299, "bundle": "Sports Socks" }
  ],
  "bundle": "Sports Socks",
  "policyDecision": "SETTLE",
  "explanation": "Approved because the final price of ₹2,299 is above the merchant's ₹2,200 floor...",
  "customerConsent": true,
  "paymentMode": "MOCK",
  "paymentStatus": "PAID",
  "razorpayOrderId": "order_test_2026demo",
  "razorpayPaymentId": "pay_test_k9384729",
  "receiptHash": "4a73ec992b1a80d4f5263a23a31c51d654f58c74032d847141348123281515b6",
  "integrity": {
    "algorithm": "SHA-256",
    "canonicalHash": "4a73ec992b1a80d4f5263a23a31c51d654f58c74032d847141348123281515b6",
    "verified": true
  }
}
```

---

## 4. Verification & Tamper Detection

When `POST /api/receipts/:id/verify` is invoked:
1. Strips `receiptHash` and `integrity`.
2. Computes SHA-256 over canonicalized payload.
3. Compares `computedHash === storedHash`.
4. Returns:
   - `INTEGRITY_VERIFIED` (if hashes match perfectly).
   - `INTEGRITY_FAILED` (if any field such as price, bundle, or agent ID was altered).
