require('dotenv').config();

const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  PERSISTENCE_MODE: process.env.PERSISTENCE_MODE || 'memory',
  MONGODB_URI: process.env.MONGODB_URI || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  PAYMENT_MODE: process.env.PAYMENT_MODE || (process.env.RAZORPAY_KEY_ID ? 'razorpay' : 'mock'),
  POLICY_TOKEN_SECRET: process.env.POLICY_TOKEN_SECRET || 'agentshield_policy_token_secret_key_2026',
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
};

module.exports = env;
