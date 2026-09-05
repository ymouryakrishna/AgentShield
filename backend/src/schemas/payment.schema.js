const { z } = require('zod');

const createPaymentOrderSchema = z.object({
  sessionId: z.string().optional().nullable(),
  amountInRupees: z.number().positive('Payment amount must be positive'),
  currency: z.string().default('INR'),
  policyAuthorizationToken: z.string().optional().nullable(),
  receiptId: z.string().optional().nullable(),
  notes: z.record(z.any()).optional().default({}),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Payment signature is required'),
  sessionId: z.string().optional().nullable(),
  amountInRupees: z.number().positive().optional().default(2299),
  paymentMethod: z.string().optional().default('Razorpay Test Mode'),
});

module.exports = {
  createPaymentOrderSchema,
  verifyPaymentSchema,
};
