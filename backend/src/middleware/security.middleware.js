const helmet = require('helmet');
const cors = require('cors');

function configureSecurityHeaders(app) {
  app.use(helmet({
    contentSecurityPolicy: false, // allow API usage & demo embeds
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Agent-Commerce-Protocol', 'X-Request-ID', 'X-Agent-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Agent-Commerce-Protocol', 'X-Agent-Shield-Protected'],
  }));
}

module.exports = configureSecurityHeaders;
