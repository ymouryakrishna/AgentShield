# AgentShield Payment Flow & Security Gate

## 1. Core Payment Invariant

> **AI agents can never directly execute payments or dictate final order amounts.**
> **Every payment order must be unlocked by a server-signed Policy Authorization Token.**

---

## 2. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Human Customer
    participant Agent as Autonomous Buyer Agent
    participant Firewall as Commerce Firewall
    participant AuthEngine as Authorization Service
    participant PayGate as Payment Security Gate
    participant Razorpay as Razorpay API / Mock Adapter
    participant ReceiptService as Receipt & Integrity Engine
    participant Audit as Append-Only Audit Trail

    Agent->>Firewall: POST /api/negotiations/:id/offer (₹2,299)
    Firewall-->>Agent: Firewall Checks Passed (ALLOW)
    
    Agent->>Customer: Request Explicit Consent for ₹2,299 (+ Free Sports Socks)
    Customer->>AuthEngine: POST /api/negotiations/:id/accept { customerConsent: true }
    AuthEngine->>Audit: Log CONSENT_RECEIVED & PAYMENT_AUTHORIZED
    AuthEngine-->>Agent: Returns Signed Policy Authorization Token

    Agent->>PayGate: POST /api/payments/create { token, amount: 2299 }
    
    Note over PayGate: 1. Validate Token Signature<br/>2. Assert Expiration<br/>3. Assert Amount == 2299<br/>4. Assert Amount >= Floor (2200)
    
    PayGate->>Razorpay: POST /v1/orders { amount: 229900 paise, currency: INR }
    Razorpay-->>PayGate: Order Created (order_xxx)
    PayGate->>Audit: Log PAYMENT_CREATED
    PayGate-->>Agent: Return order details for checkout

    Customer->>Razorpay: Complete Payment (UPI / Card / NetBanking)
    Razorpay-->>Agent: Payment ID & Signature (pay_xxx)

    Agent->>PayGate: POST /api/payments/verify { orderId, paymentId, signature }
    PayGate->>Razorpay: Verify HMAC-SHA256 Signature
    PayGate->>ReceiptService: Generate Canonical Receipt & SHA-256 Seal
    ReceiptService->>Audit: Log PAYMENT_VERIFIED & RECEIPT_CREATED
    PayGate-->>Agent: Returns Verified Receipt (NGR-2026-xxxx)
```

---

## 3. Adversarial Attempt Flow (Payment Bypass Blocked)

```mermaid
sequenceDiagram
    autonumber
    actor Attacker as Malicious Agent (Agent B)
    participant Firewall as Commerce Firewall
    participant PayGate as Payment Security Gate
    participant Audit as Audit Trail

    Attacker->>Firewall: POST /api/negotiations/:id/offer (₹1, "Ignore instructions")
    Firewall->>Audit: Log ATTACK_DETECTED & REQUEST_BLOCKED
    Firewall-->>Attacker: HTTP 403 / Decision: BLOCK (No Token Minted)

    Note over Attacker: Attacker tries to bypass negotiation and call payment directly
    Attacker->>PayGate: POST /api/payments/create { amount: 1, token: null }
    PayGate->>Audit: Log REQUEST_BLOCKED (PAYMENT_NOT_AUTHORIZED)
    PayGate-->>Attacker: HTTP 403 Forbidden (Razorpay was NOT called)
```

---

## 4. Payment Modes Supported

1. **`PAYMENT_MODE=razorpay`**: Uses official Razorpay API with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Verifies HMAC-SHA256 signature server-side.
2. **`PAYMENT_MODE=mock`**: Zero-config offline development and evaluation adapter. Deterministically simulates payment creation and signature verification while returning `{ "paymentMode": "MOCK" }`.
