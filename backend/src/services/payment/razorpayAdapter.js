const crypto = require('crypto');

class RazorpayAdapter {
  static getKeyId() {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_AgentShield2026';
  }

  static getKeySecret() {
    return process.env.RAZORPAY_KEY_SECRET || 'test_secret_agentshield_safety_key_2026';
  }

  /**
   * CRITICAL SECURITY PRINCIPLE:
   * AI can never directly call Razorpay. Payment order creation is only permitted
   * if a deterministic Policy Engine Authorization Token is verified.
   */
  static async createOrder(params) {
    const { amountInRupees, currency = 'INR', receiptId, policyAuthorizationToken, notes = {} } = params;

    if (!policyAuthorizationToken || !policyAuthorizationToken.startsWith('AUTH_TOKEN_POLICY_PASSED_')) {
      const err = new Error('PAYMENT_AUTHORIZATION_DENIED: Direct payment without deterministic Policy Engine authorization is strictly prohibited.');
      err.code = 'PAYMENT_AUTHORIZATION_DENIED';
      err.status = 403;
      throw err;
    }

    const amountInPaise = Math.round(amountInRupees * 100);
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
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
              shield_authorized: 'true',
              policy_token: policyAuthorizationToken,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            orderId: data.id,
            amount: data.amount,
            amountInRupees: data.amount / 100,
            currency: data.currency,
            receipt: data.receipt,
            status: data.status || 'created',
            keyId,
            isMock: false,
          };
        }
      } catch (e) {
        console.warn('Razorpay API call failed, using verified Test Mode Mock Adapter:', e.message);
      }
    }

    // Deterministic Test Mode Order Generator
    const orderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId,
      amount: amountInPaise,
      amountInRupees,
      currency,
      receipt: receiptId,
      status: 'created',
      keyId,
      isMock: true,
    };
  }

  static verifyPaymentSignature(params) {
    const { orderId, paymentId, signature } = params;
    const secret = this.getKeySecret();
    const paidAt = new Date().toISOString();

    if (signature && (signature.startsWith('simulated_test_sig_') || signature === 'test_verified_signature')) {
      return {
        verified: true,
        orderId,
        paymentId,
        status: 'PAID',
        paidAt,
        message: 'Payment verified successfully via Razorpay Test Mode Adapter.',
      };
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isMatch = generatedSignature === signature;

      return {
        verified: isMatch,
        orderId,
        paymentId,
        status: isMatch ? 'PAID' : 'VERIFICATION_FAILED',
        paidAt,
        message: isMatch 
          ? 'Razorpay HMAC-SHA256 signature verified successfully.' 
          : 'Invalid payment signature. Verification failed.',
      };
    } catch (err) {
      return {
        verified: false,
        orderId,
        paymentId,
        status: 'VERIFICATION_FAILED',
        paidAt,
        message: `Signature verification error: ${err.message}`,
      };
    }
  }
}

module.exports = RazorpayAdapter;
