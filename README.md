# AgentShield — The Trust Layer for AI Commerce

[![Razorpay Buildathon](https://img.shields.io/badge/Razorpay_Buildathon-Track_01:_AI_Growth_%26_Agentic_Commerce-blue.svg)](https://razorpay.com)
[![Test Suite](https://img.shields.io/badge/Tests-45_Passed_%7C_10_Suites-brightgreen.svg)]()
[![System Verification](https://img.shields.io/badge/System_Verification-18%2F18_Passed-success.svg)]()
[![Security Invariant](https://img.shields.io/badge/Security-Policy_Gated_Payment-red.svg)]()

> **"AI negotiates. Policy decides. Every transaction explains why."**  
> *"AI proposes. Policy authorizes. Customer consents. Razorpay executes. The receipt proves why."*

---

## 🌟 Overview

**AgentShield** is a production-grade trust and safety infrastructure built for **Razorpay Buildathon Track 01 (AI Growth & Agentic Commerce)**. It makes merchants sellable to autonomous AI buyer agents while deterministically protecting pricing floors, gross margins, and payment execution against prompt injections and adversarial exploits.

---

## 🛡️ Core Security Invariants

1. **AI Never Executes Money Actions Directly**: Every payment order requires a cryptographically signed `Policy Authorization Token` (HMAC-SHA256).
2. **10-Check Deterministic Commerce Firewall**: Server-side code enforces Agent Identity, Product Permissions, Rate Limits, Merchant Policies, Price Floors, Discount Limits, Round Limits, Prompt Injection Shields, Order Value Caps, and Customer Consent.
3. **Tamper-Evident Receipts**: Post-settlement transactions are canonicalized and sealed with **SHA-256**.
4. **Dynamic Revenue Growth**: AI-readable catalog (`GET /api/catalog/ai`) and smart bundling rules (e.g. Free Sports Socks $\ge$ ₹2,299) drive measurable AOV uplift.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+ (v20+ recommended)
- npm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/username/AgentShield.git
cd AgentShield/backend

# Install backend dependencies
npm install
```

### 3. Configuration
Copy `.env.example` to `.env` (Zero-config Mock Payment mode is enabled by default):
```bash
cp .env.example .env
```

### 4. Running the Backend Server
```bash
# In backend/ directory
npm start
# Server listens on http://localhost:5000
```

### 5. Running the Complete Test Suite
```bash
# Run all 10 unit test suites (45 test cases)
npm test

# Run comprehensive live system verification (18 subsystems)
npm run verify
```

---

## 📁 System Architecture

```text
AgentShield/
├── backend/
│   ├── src/
│   │   ├── app.js                          # Express app & middleware pipeline
│   │   ├── server.js                       # Server entrypoint
│   │   ├── config/                         # Env, database, catalog seed, constants
│   │   ├── models/                         # Products, Policies, Sessions, Receipts, Audit
│   │   ├── routes/                         # Health, Catalog, Policy, Firewall, Payments, Demo
│   │   ├── controllers/                    # 12 Modular Controllers
│   │   ├── services/                       # 13 Dedicated Business & Security Services
│   │   ├── middleware/                     # Helmet, RateLimit, Auth, RequestId, Error
│   │   ├── schemas/                        # Zod Request Schemas
│   │   └── utils/                          # Canonical JSON, HMAC-SHA256, Logger, Errors
│   └── tests/                              # 10 Unit & E2E Test Suites
├── docs/
│   ├── architecture.md                     # System architecture & Mermaid diagrams
│   ├── security.md                         # Threat model & 10 Firewall checks
│   ├── api.md                              # Complete REST API specification
│   ├── payment-flow.md                     # Razorpay & Token gated payment flow
│   ├── negotiation.md                      # Bounded negotiation & bundling engine
│   ├── receipt-integrity.md                # Canonical JSON SHA-256 verification
│   ├── demo-script.md                      # 3-minute hackathon presentation script
│   └── judge-questions.md                  # Detailed technical answers for judges
├── tests/
│   └── verify-all-services.js              # Comprehensive system verification script
└── README.md
```

---

## 🧪 Verification & Demo Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | `GET` | System health check |
| `/api/catalog/ai` | `GET` | Machine-readable AI agent catalog |
| `/api/demo/legitimate` | `POST` | 1-Click Legitimate Agent flow (3 rounds, bundle, token, payment, receipt) |
| `/api/demo/adversarial` | `POST` | 1-Click Adversarial ₹1 attack (Firewall blocks, 0 tokens, 0 payments) |
| `/api/receipts/:id/verify` | `POST` | Cryptographic SHA-256 receipt integrity verification |
| `/api/metrics` | `GET` | Real-time database-derived AOV & uplift metrics |
| `/api/audit` | `GET` | Immutable chronological audit trail |

---

## 📄 License
MIT License. Built for the Razorpay Buildathon 2026.
