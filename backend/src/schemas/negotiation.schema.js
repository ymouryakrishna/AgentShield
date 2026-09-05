const { z } = require('zod');

const createNegotiationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  buyerAgentId: z.string().min(1, 'Buyer Agent ID is required'),
  buyerAgentName: z.string().optional(),
});

const offerSchema = z.object({
  proposedPrice: z.number().positive('Proposed price must be positive'),
  promptText: z.string().optional().default(''),
  customerConsent: z.boolean().optional().default(false),
  intent: z.enum(['NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'CHECKOUT', 'PURCHASE']).optional().default('NEGOTIATE'),
  productId: z.string().optional(),
  buyerAgentId: z.string().optional(),
});

const acceptOfferSchema = z.object({
  finalPrice: z.number().positive().optional(),
  customerConsent: z.boolean().refine(val => val === true, {
    message: 'Explicit customer consent is mandatory to settle and authorize payment.',
  }),
});

module.exports = {
  createNegotiationSchema,
  offerSchema,
  acceptOfferSchema,
};
