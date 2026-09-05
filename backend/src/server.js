const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🛡️  AgentShield Backend Server listening on http://localhost:${PORT}`);
    logger.info(`💳 Payment Mode: ${env.PAYMENT_MODE.toUpperCase()} | Persistence: ${env.PERSISTENCE_MODE.toUpperCase()}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
