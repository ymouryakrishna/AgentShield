# AgentShield Backend

> **Deterministic Policy Engine, Commerce Firewall, and Razorpay Test Mode Adapter**

## Architecture Responsibilities
- AI Agent Orchestration & AI-Readable Catalog (`/api/catalog/ai`)
- Deterministic Commerce Firewall (`/api/firewall/evaluate`) with 10 checks & prompt injection detector
- Bounded Multi-Turn Negotiation Engine (`/api/negotiations`)
- Zero-Hallucination Explainability Engine (facts -> plain-English explanation)
- Canonical Negotiation Receipt Generator sealed with SHA-256 tamper-evident hash
- Server-Side Razorpay Test Mode Order Creation gated strictly by Policy Authorization Token
- Chronological Audit Logging & Real-Time Dynamic AOV Metric Calculation

## Setup & Run
```bash
npm install
npm start
# Server listens on http://localhost:5000
```

## Running Tests
```bash
npm test
```
