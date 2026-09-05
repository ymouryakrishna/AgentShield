# AgentShield Anticipated Judge Questions & Technical Answers

### Q1: "Why can't you just use an LLM prompt to enforce the minimum price?"
> **Answer**: "LLM system prompts are probabilistic and fundamentally vulnerable to adversarial jailbreaks, context stuffing, and prompt injections. If an LLM is the only gatekeeper, an attacker can eventually trick it into agreeing to ₹1. In AgentShield, we separate AI *proposals* from *deterministic policy evaluation*. Even if an LLM is completely fooled by an attack, our server-side code checks `proposedPrice >= floorPrice` and blocks the transaction before payment tokens can ever be minted."

---

### Q2: "How do you prevent an AI agent from bypassing your firewall and calling Razorpay directly?"
> **Answer**: "Our Razorpay payment endpoint is gated by a cryptographically signed `Policy Authorization Token` (HMAC-SHA256). The token binds the exact `sessionId`, `agentId`, `productId`, `authorizedAmount`, `policyVersion`, and `expiration`. When a payment request comes in, our payment service recalculates the signature, verifies the amount against the token and the product floor, and asserts the expiration timestamp. Any direct or malformed request returns `HTTP 403 Forbidden` without touching Razorpay."

---

### Q3: "How does AgentShield grow the merchant's revenue (Track 1 Challenge)?"
> **Answer**: "AgentShield provides two direct revenue drivers:
> 1. **Machine Discovery (`/api/catalog/ai`)**: Merchants become instantly discoverable and transactable to autonomous AI buyer agents, opening a massive new acquisition channel.
> 2. **Smart Bundling & Margin Preservation**: Instead of giving away pure cash discounts when negotiation stalls, the engine introduces value-add bundles (e.g. Free Sports Socks on orders $\ge$ ₹2,299), which raises Average Order Value (AOV) and conversion while protecting gross margins."

---

### Q4: "What happens if an adversarial prompt is novel and doesn't match your regex patterns?"
> **Answer**: "This is the core strength of our **Defense in Depth** architecture. Even if a zero-day prompt injection completely slips past Check 8 (Prompt Injection Shield), the transaction will still hit Check 5 (Price Boundary: `proposedPrice >= floorPrice`), Check 6 (Discount Boundary), and Check 10 (Customer Consent). Check 5 will deterministically reject any price below ₹2,200 regardless of the prompt."

---

### Q5: "How does the cryptographic receipt work and why is canonicalization necessary?"
> **Answer**: "JSON serialization can vary across platforms due to key ordering or whitespace, which would produce different hashes for identical data. We use a deterministic canonical JSON serializer that lexicographically sorts all keys and eliminates whitespace before feeding the UTF-8 bytes into SHA-256. If either party alters even a single character in the final price or bundled item post-settlement, the hash mismatch is immediately flagged as `INTEGRITY_FAILED`."
