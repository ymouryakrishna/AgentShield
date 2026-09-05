const { z } = require('zod');

const commerceRequestSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  intent: z.enum(['DISCOVERY', 'NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'CHECKOUT', 'DIRECT_PURCHASE', 'PURCHASE']),
  productId: z.string().min(1, 'Product ID is required'),
  proposedPrice: z.number().positive('Proposed price must be positive'),
  quantity: z.number().int().positive().default(1),
  requestedAction: z.string().optional().default('NEGOTIATE'),
  round: z.number().int().min(1).default(1),
  promptText: z.string().optional().default(''),
  customerConsent: z.boolean().default(false),
  context: z.record(z.any()).optional().default({}),
  requestId: z.string().optional(),
});

module.exports = {
  commerceRequestSchema,
};
