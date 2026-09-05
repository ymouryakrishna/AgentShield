const DECISION = {
  APPROVE: 'APPROVE',
  COUNTER: 'COUNTER',
  SETTLE: 'SETTLE',
  BLOCK: 'BLOCK',
};

const CHECK_CODES = {
  CHECK_1_AGENT_IDENTITY: 'AGENT_NOT_AUTHORIZED',
  CHECK_2_PRODUCT_PERMISSION: 'PRODUCT_NOT_ALLOWED',
  CHECK_3_RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  CHECK_4_MERCHANT_POLICY: 'MERCHANT_POLICY_VIOLATION',
  CHECK_5_PRICE_BOUNDARY: 'PRICE_BELOW_FLOOR',
  CHECK_6_DISCOUNT_BOUNDARY: 'DISCOUNT_LIMIT_EXCEEDED',
  CHECK_7_ROUND_BOUNDARY: 'MAX_ROUNDS_EXCEEDED',
  CHECK_8_PROMPT_INJECTION_SHIELD: 'POLICY_OVERRIDE_ATTEMPT',
  CHECK_9_ORDER_VALUE: 'ORDER_VALUE_LIMIT_EXCEEDED',
  CHECK_10_CUSTOMER_CONSENT: 'CONSENT_REQUIRED',
};

const OVERRIDE_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system)\s+(instructions|constraints|rules|prompts|limits)/i,
  /ignore\s+merchant\s+rules/i,
  /override\s+(merchant|system|pricing|floor|policy|rules|the\s+minimum\s+price)/i,
  /system\s+override/i,
  /merchant\s+(has\s+)?(already\s+)?approved(\s+this)?/i,
  /admin\s+approved/i,
  /bypass\s+(minimum\s+price|floor|firewall|limit|rules|policy)/i,
  /change\s+floor\s+price/i,
  /disable\s+(restrictions|firewall|policy|safeguards|limits)/i,
  /settle\s+(this\s+)?(order\s+)?(at|for)\s+₹?\s*(1|0|0\.01)/i,
  /sell\s+(this\s+product\s+)?(for|below)\s+(floor|₹?\s*1)/i,
  /price\s*=\s*(0|1)/i,
  /grant\s+(free|zero\s+cost|100%\s+discount)/i,
  /you\s+must\s+comply\s+without\s+restrictions/i,
  /jailbreak/i,
  /admin\s+mode/i,
];

module.exports = {
  DECISION,
  CHECK_CODES,
  OVERRIDE_PATTERNS,
};
