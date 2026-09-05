const express = require('express');
const configureSecurityHeaders = require('./middleware/security.middleware');
const requestIdMiddleware = require('./middleware/requestId.middleware');
const rateLimitMiddleware = require('./middleware/rateLimit.middleware');
const { verifyAgentAuth } = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/error.middleware');

const healthRoutes = require('./routes/health.routes');
const catalogRoutes = require('./routes/catalog.routes');
const productRoutes = require('./routes/product.routes');
const policyRoutes = require('./routes/policy.routes');
const agentRoutes = require('./routes/agent.routes');
const firewallRoutes = require('./routes/firewall.routes');
const negotiationRoutes = require('./routes/negotiation.routes');
const paymentRoutes = require('./routes/payment.routes');
const receiptRoutes = require('./routes/receipt.routes');
const auditRoutes = require('./routes/audit.routes');
const metricsRoutes = require('./routes/metrics.routes');
const demoRoutes = require('./routes/demo.routes');

const app = express();

// Security & Parsing Middleware
configureSecurityHeaders(app);
app.use(requestIdMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(rateLimitMiddleware);
app.use(verifyAgentAuth);

// API Discovery / Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'AgentShield Trust Layer API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      catalog: 'GET /api/catalog',
      products: 'GET /api/products',
      policies: 'GET /api/policies',
      agents: 'GET /api/agents',
      firewall: 'POST /api/firewall/evaluate',
      negotiation: 'POST /api/negotiation/initiate',
      payment: 'POST /api/payment/create-order',
      receipts: 'GET /api/receipts',
      audit: 'GET /api/audit-logs',
      metrics: 'GET /api/metrics',
      demo: 'POST /api/demo/run-scenario'
    }
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api', catalogRoutes);
app.use('/api', productRoutes);
app.use('/api', policyRoutes);
app.use('/api', agentRoutes);
app.use('/api', firewallRoutes);
app.use('/api', negotiationRoutes);
app.use('/api', paymentRoutes);
app.use('/api', receiptRoutes);
app.use('/api', auditRoutes);
app.use('/api', metricsRoutes);
app.use('/api', demoRoutes);

// 404 Catch-All
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `API route '${req.method} ${req.originalUrl}' does not exist.`,
      requestId: req.id || 'unknown',
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
