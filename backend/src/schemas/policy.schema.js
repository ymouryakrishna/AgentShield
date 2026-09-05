const { z } = require('zod');

const updatePolicySchema = z.object({
  floorPrice: z.number().positive().optional(),
  maxDiscountPercent: z.number().min(0).max(100).optional(),
  maxNegotiationRounds: z.number().int().min(1).max(10).optional(),
  maxOrderValue: z.number().positive().optional(),
  negotiationEnabled: z.boolean().optional(),
  promptInjectionProtection: z.boolean().optional(),
  bundleMinimumPrice: z.number().positive().optional(),
});

module.exports = {
  updatePolicySchema,
};
