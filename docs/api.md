# AgentShield REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. System Health
- **`GET /api/health`**
  - Response: `{ "success": true, "status": "HEALTHY", "service": "AgentShield Trust Layer Backend", "version": "1.0.0" }`

---

## 2. Catalog & Discovery
- **`GET /api/catalog`**
  - Returns human/app product listing.
- **`GET /api/catalog/ai`**
  - Returns machine-readable AI catalog with headers `X-Agent-Commerce-Protocol: AgentCommerce-v1` and `X-Agent-Shield-Protected: true`.

---

## 3. Policy Management
- **`GET /api/policies`**
  - Returns all merchant policy envelopes (`listPrice`, `floorPrice`, `maxDiscountPercent`, `maxNegotiationRounds`, `bundleRules`).
- **`PUT /api/policies/:id`**
  - Updates merchant policy boundaries. Rejects invalid floor price $> \text{listPrice}$.

---

## 4. Agent Registry
- **`GET /api/agents`**
  - Lists registered AI agents (`agent_demo_legitimate`, `agent_demo_adversarial`, etc.).
- **`POST /api/agents`**
  - Registers a new autonomous buyer agent.

---

## 5. Commerce Firewall
- **`POST /api/firewall/evaluate`**
  - Body:
    ```json
    {
      "agentId": "agent_demo_legitimate",
      "intent": "NEGOTIATE",
      "productId": "running-shoes",
      "proposedPrice": 2299,
      "round": 2,
      "promptText": "Can you offer ₹2,299?",
      "customerConsent": false
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "allowed": true,
      "decision": "APPROVE",
      "evaluation": {
        "checks": { "agentIdentity": true, "priceBoundary": true, ... },
        "failedChecks": [],
        "explanation": "..."
      }
    }
    ```

---

## 6. Bounded Negotiation
- **`POST /api/negotiations`**
  - Body: `{ "productId": "running-shoes", "buyerAgentId": "agent_demo_legitimate" }`
- **`GET /api/negotiations/:id`**
  - Retrieves session state, rounds, offers, and counteroffers.
- **`POST /api/negotiations/:id/offer`**
  - Submits buyer offer; executes firewall; calculates margin-preserving counteroffer.
- **`POST /api/negotiations/:id/accept`**
  - Body: `{ "finalPrice": 2299, "customerConsent": true }`
  - Validates consent and floor price; mints `policyAuthorizationToken`.

---

## 7. Gated Payment Execution
- **`POST /api/payments/create`**
  - Body:
    ```json
    {
      "sessionId": "NGS-XXXX",
      "amountInRupees": 2299,
      "policyAuthorizationToken": "AUTH_TOKEN_..."
    }
    ```
  - Rejects with `HTTP 403 Forbidden` if token is absent, invalid, tampered, or below floor.
- **`POST /api/payments/verify`**
  - Body: `{ "orderId": "...", "paymentId": "...", "signature": "...", "amountInRupees": 2299 }`
  - Verifies HMAC signature, registers transaction, and returns sealed `NegotiationReceipt`.

---

## 8. Cryptographic Receipts
- **`GET /api/receipts`**
  - Lists all issued negotiation receipts.
- **`GET /api/receipts/:id`**
  - Returns receipt with canonical SHA-256 hash and integrity status.
- **`POST /api/receipts/:id/verify`**
  - Recomputes canonical hash; returns `{ "status": "INTEGRITY_VERIFIED", "isValid": true }`.

---

## 9. Audit & Metrics
- **`GET /api/audit`**
  - Query params: `?agentId=...&action=...&status=...&limit=50`
- **`GET /api/metrics`**
  - Returns database-derived real-time metrics: `baselineAOV`, `negotiatedAOV`, `aovUplift`, `totalOrders`, `blockedAttacks`, `bundleAttachmentRate`.

---

## 10. 1-Click Interactive Demos
- **`POST /api/demo/legitimate`**
  - Full happy path flow (3 rounds, bundle, consent, token, payment, receipt).
- **`POST /api/demo/adversarial`**
  - Adversarial ₹1 injection attack intercepted by firewall; payment denied; 0 tokens issued.
