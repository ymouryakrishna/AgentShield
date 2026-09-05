const { SEED_PRODUCTS } = require('./catalog');
const { generateSha256Hash } = require('../utils/canonicalJson');

class DatabaseStore {
  constructor() {
    this.products = new Map();
    this.policies = new Map();
    this.agents = new Map();
    this.sessions = new Map();
    this.transactions = new Map();
    this.receipts = new Map();
    this.auditEvents = [];
    this.authorizationTokens = new Map();

    this.initSeedData();
  }

  initSeedData() {
    // 1. Seed Products & Merchant Policies
    for (const prod of SEED_PRODUCTS) {
      this.products.set(prod.id, { ...prod });
      if (prod.aliasId) {
        this.products.set(prod.aliasId, { ...prod });
      }

      this.policies.set(prod.id, {
        id: `pol-${prod.id}`,
        productId: prod.id,
        productName: prod.name,
        listPrice: prod.listPrice,
        floorPrice: prod.floorPrice,
        maxDiscountPercent: prod.maxDiscountPercent,
        maxNegotiationRounds: prod.maxNegotiationRounds,
        maxOrderValue: 50000,
        negotiationEnabled: prod.negotiable,
        promptInjectionProtection: true,
        bundleRules: prod.bundleRules || [],
      });

      if (prod.aliasId) {
        this.policies.set(prod.aliasId, this.policies.get(prod.id));
      }
    }

    // 2. Seed Registered Agents
    const seedAgents = [
      {
        agentId: 'agent_demo_legitimate',
        name: 'Agent A (Smart Shopper AI)',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'LEGITIMATE',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'agent_demo_adversarial',
        name: 'Agent B (Adversarial Prober)',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'ADVERSARIAL',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'agent-a-legitimate',
        name: 'Agent A (Smart Shopper AI)',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'LEGITIMATE',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'agent-b-adversarial',
        name: 'Agent B (Adversarial Prober)',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'ADVERSARIAL',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'buyer-ai-agent',
        name: 'Autonomous Web Shopper',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'LEGITIMATE',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'LegitimateShoppingAgent',
        name: 'Legitimate Shopping Agent',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'LEGITIMATE',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'AdversarialAgent',
        name: 'Adversarial Exploitation Agent',
        status: 'ACTIVE',
        whitelisted: true,
        type: 'ADVERSARIAL',
        createdAt: '2026-08-30T10:00:00Z',
      },
      {
        agentId: 'agent_disabled_rogue',
        name: 'Disabled Scraper Bot',
        status: 'DISABLED',
        whitelisted: false,
        type: 'UNTRUSTED',
        createdAt: '2026-08-30T10:00:00Z',
      }
    ];

    for (const ag of seedAgents) {
      this.agents.set(ag.agentId, ag);
    }

    // 3. Seed Non-negotiated & Negotiated Transactions for Baseline Metrics
    const baseOrders = [
      { id: 'TXN-BASE-01', productId: 'running-shoes', productName: 'Running Shoes', isNegotiated: false, listPrice: 2499, finalPrice: 2499, status: 'PAID', timestamp: '2026-08-28T09:12:00Z' },
      { id: 'TXN-BASE-02', productId: 'sports-t-shirt', productName: 'Sports T-Shirt', isNegotiated: false, listPrice: 899, finalPrice: 899, status: 'PAID', timestamp: '2026-08-28T11:45:00Z' },
      { id: 'TXN-BASE-03', productId: 'gym-bag', productName: 'Gym Bag', isNegotiated: false, listPrice: 1299, finalPrice: 1299, status: 'PAID', timestamp: '2026-08-29T14:20:00Z' },
      { id: 'TXN-BASE-04', productId: 'running-shoes', productName: 'Running Shoes', isNegotiated: false, listPrice: 2499, finalPrice: 2499, status: 'PAID', timestamp: '2026-08-29T16:30:00Z' },
      { id: 'TXN-BASE-05', productId: 'sports-socks', productName: 'Sports Socks', isNegotiated: false, listPrice: 299, finalPrice: 299, status: 'PAID', timestamp: '2026-08-30T10:15:00Z' },
    ];

    const negOrders = [
      { id: 'TXN-NEG-01', productId: 'running-shoes', productName: 'Running Shoes', isNegotiated: true, listPrice: 2499, finalPrice: 2299, bundleAttached: 'Sports Socks', status: 'PAID', timestamp: '2026-08-31T10:31:25Z' },
      { id: 'TXN-NEG-02', productId: 'running-shoes', productName: 'Running Shoes', isNegotiated: true, listPrice: 2499, finalPrice: 2350, bundleAttached: 'Sports Socks', status: 'PAID', timestamp: '2026-08-31T09:15:00Z' },
      { id: 'TXN-NEG-03', productId: 'gym-bag', productName: 'Gym Bag', isNegotiated: true, listPrice: 1299, finalPrice: 1249, bundleAttached: 'Water Bottle', status: 'PAID', timestamp: '2026-08-31T08:40:00Z' },
    ];

    for (const ord of [...baseOrders, ...negOrders]) {
      this.transactions.set(ord.id, ord);
    }

    // 4. Seed Canonical Receipt
    const partialSeedReceipt = {
      receiptId: 'NGR-2026-0001',
      timestamp: '2026-08-31T10:31:26.110Z',
      agentId: 'agent_demo_legitimate',
      sessionId: 'NGS-DEMO-2026',
      product: {
        id: 'running-shoes',
        name: 'Running Shoes',
        category: 'sports',
      },
      listPrice: 2499,
      floorPrice: 2200,
      finalPrice: 2299,
      discountPercent: 8.0,
      maxDiscountPercent: 12.0,
      negotiationRounds: 3,
      offerHistory: [
        { round: 1, actor: 'BUYER_AGENT', price: 2200, bundle: null },
        { round: 1, actor: 'MERCHANT_AGENT', price: 2399, bundle: null },
        { round: 2, actor: 'BUYER_AGENT', price: 2250, bundle: null },
        { round: 2, actor: 'MERCHANT_AGENT', price: 2299, bundle: 'Sports Socks' },
        { round: 3, actor: 'BUYER_AGENT', price: 2299, bundle: 'Sports Socks' },
      ],
      bundle: 'Sports Socks',
      policyDecision: 'SETTLE',
      policyFacts: {
        decision: 'SETTLE',
        productId: 'running-shoes',
        proposedPrice: 2299,
        floorPrice: 2200,
        discountPercent: 8.0,
        maxDiscountPercent: 12.0,
        round: 3,
        maxRounds: 3,
        bundleAllowed: true,
        bundleGranted: 'Sports Socks',
        customerConsent: true,
      },
      explanation: 'Approved because the final price of ₹2,299 is above the merchant\'s ₹2,200 floor, the discount is within the allowed 12% limit, the negotiation remained within 3 rounds, the bundle condition was satisfied, and customer confirmation was received.',
      customerConsent: true,
      paymentMode: 'MOCK',
      paymentStatus: 'PAID',
      razorpayOrderId: 'order_test_2026demo',
      razorpayPaymentId: 'pay_test_k9384729',
    };

    const hash = generateSha256Hash(partialSeedReceipt);
    const fullSeedReceipt = {
      ...partialSeedReceipt,
      receiptHash: hash,
      integrity: {
        algorithm: 'SHA-256',
        canonicalHash: hash,
        verified: true,
      }
    };

    this.receipts.set(fullSeedReceipt.receiptId, fullSeedReceipt);

    // 5. Seed Audit Events
    this.auditEvents = [
      { eventId: 'AUD-001', timestamp: '2026-08-31T10:31:02.120Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'AGENT_REQUEST', status: 'SUCCESS', decision: 'ALLOW', reason: 'Legitimate AI buyer agent connected.', metadata: {}, requestId: 'REQ-01' },
      { eventId: 'AUD-002', timestamp: '2026-08-31T10:31:06.012Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'OFFER_CREATED', status: 'SUCCESS', decision: 'COUNTER', reason: 'Round 1: Buyer proposed ₹2,200.', metadata: { price: 2200, round: 1 }, requestId: 'REQ-02' },
      { eventId: 'AUD-003', timestamp: '2026-08-31T10:31:08.450Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'COUNTER_OFFER', status: 'SUCCESS', decision: 'COUNTER', reason: 'Merchant counteroffered ₹2,399 within envelope.', metadata: { price: 2399, round: 1 }, requestId: 'REQ-03' },
      { eventId: 'AUD-004', timestamp: '2026-08-31T10:31:10.820Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'COUNTER_OFFER', status: 'SUCCESS', decision: 'COUNTER', reason: 'Merchant proposed ₹2,299 with free Sports Socks (Round 2/3).', metadata: { price: 2299, bundle: 'Sports Socks' }, requestId: 'REQ-04' },
      { eventId: 'AUD-005', timestamp: '2026-08-31T10:31:15.004Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'CONSENT_RECEIVED', status: 'SUCCESS', decision: 'ALLOW', reason: 'Customer explicitly verified and consented to ₹2,299 settlement.', metadata: {}, requestId: 'REQ-05' },
      { eventId: 'AUD-006', timestamp: '2026-08-31T10:31:16.290Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'PAYMENT_AUTHORIZED', status: 'SUCCESS', decision: 'ALLOW', reason: 'All 10 firewall checks passed. Policy Authorization Token issued.', metadata: {}, requestId: 'REQ-06' },
      { eventId: 'AUD-007', timestamp: '2026-08-31T10:31:18.510Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'PAYMENT_CREATED', status: 'SUCCESS', decision: 'ALLOW', reason: 'Payment order order_test_2026demo created.', metadata: {}, requestId: 'REQ-07' },
      { eventId: 'AUD-008', timestamp: '2026-08-31T10:31:25.640Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'PAYMENT_VERIFIED', status: 'SUCCESS', decision: 'ALLOW', reason: 'Payment signature verified successfully.', metadata: {}, requestId: 'REQ-08' },
      { eventId: 'AUD-009', timestamp: '2026-08-31T10:31:26.110Z', agentId: 'agent_demo_legitimate', sessionId: 'NGS-DEMO-2026', action: 'RECEIPT_CREATED', status: 'SUCCESS', decision: 'ALLOW', reason: 'Negotiation receipt NGR-2026-0001 sealed with SHA-256 hash.', metadata: { receiptHash: hash }, requestId: 'REQ-09' },
      { eventId: 'AUD-010', timestamp: '2026-08-31T10:32:01.050Z', agentId: 'agent_demo_adversarial', sessionId: 'NGS-ADV-001', action: 'ATTACK_DETECTED', status: 'WARNING', decision: 'BLOCK', reason: 'Adversarial prompt injection signature detected in payload.', metadata: { pattern: 'ignore previous instructions' }, requestId: 'REQ-ADV-01' },
      { eventId: 'AUD-011', timestamp: '2026-08-31T10:32:01.080Z', agentId: 'agent_demo_adversarial', sessionId: 'NGS-ADV-001', action: 'REQUEST_BLOCKED', status: 'BLOCKED', decision: 'BLOCK', reason: 'Requested price ₹1 is below merchant floor ₹2,200. Payment authorization DENIED.', metadata: { price: 1, floor: 2200 }, requestId: 'REQ-ADV-02' }
    ];
  }
}

const mongoose = require('mongoose');
const env = require('./env');
const AuditLog = require('../models/AuditLog');

const db = new DatabaseStore();

module.exports = {
  db,
  connectDB: async () => {
    if (env.MONGODB_URI) {
      try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('📦 Connected to MongoDB successfully via Mongoose');

        const count = await AuditLog.countDocuments();
        if (count === 0 && db.auditEvents.length > 0) {
          await AuditLog.insertMany(
            db.auditEvents.map(e => ({
              ...e,
              timestamp: new Date(e.timestamp),
            }))
          );
          console.log(`📦 Seeded ${db.auditEvents.length} initial audit logs into MongoDB`);
        }
      } catch (err) {
        console.warn(`⚠️ MongoDB connection error (${err.message}). Active Store: In-Memory Fallback.`);
      }
    } else {
      console.log('📦 Database initialized: In-Memory / Mongoose Compatible Store Active');
    }
  }
};
