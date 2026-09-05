const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

class RazorpayService {
  static getKeyId() {
    return env.RAZORPAY_KEY_ID;
  }

  static getKeySecret() {
    return env.RAZORPAY_KEY_SECRET;
  }

  static isConfigured() {
    return !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
  }

  static async createOrder(params) {
    const { amountInRupees, currency = 'INR', receiptId, notes = {} } = params;
    const amountInPaise = Math.round(amountInRupees * 100);
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured.');
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
        notes: {
          ...notes,
          shield_protected: 'true',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error('Razorpay Order API Error', { body: errBody });
      throw new Error(`Razorpay API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      orderId: data.id,
      amount: data.amount,
      amountInRupees: data.amount / 100,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status || 'created',
      paymentMode: 'RAZORPAY_TEST',
      keyId,
      isMock: false,
    };
  }

  static verifyPaymentSignature(params) {
    const { orderId, paymentId, signature } = params;
    const keySecret = this.getKeySecret();

    if (!keySecret) {
      throw new Error('Razorpay secret not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isMatch = expectedSignature === signature;

    return {
      verified: isMatch,
      orderId,
      paymentId,
      status: isMatch ? 'PAID' : 'VERIFICATION_FAILED',
      paymentMode: 'RAZORPAY_TEST',
      paidAt: new Date().toISOString(),
      message: isMatch ? 'Razorpay HMAC-SHA256 signature verified.' : 'Invalid signature.',
    };
  }
}

module.exports = RazorpayService;
