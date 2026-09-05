export type Currency = 'INR';

export interface BundleConfig {
  freeGift: string;
  freeGiftProductId?: string;
  minimumPrice: number;
  description?: string;
}

export interface NegotiationEnvelope {
  floorPrice: number;
  maxDiscountPercent: number;
  maxRounds: number;
  allowBundles: boolean;
  bundle?: BundleConfig;
  requireCustomerConfirmation: boolean;
  maxOrderValue: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: Currency;
  stock: number;
  negotiable: boolean;
  negotiation: NegotiationEnvelope;
  bundle?: BundleConfig;
  crossSellIds: string[];
  upsellIds: string[];
  attributes: Record<string, any>;
  imageUrl?: string;
}

export interface AgentIdentity {
  id: string;
  name: string;
  type: 'legitimate_buyer' | 'adversarial_buyer' | 'merchant_agent' | 'human_customer';
  reputationScore: number;
  verified: boolean;
  allowedActions: string[];
}

export interface AgentCommerceRequest {
  requestId: string;
  agentId: string;
  agentName?: string;
  intent: 'DISCOVERY' | 'NEGOTIATE' | 'COUNTER_OFFER' | 'ACCEPT_OFFER' | 'CHECKOUT' | 'DIRECT_PURCHASE';
  productId: string;
  proposedPrice: number;
  quantity: number;
  round: number;
  requestedBundle?: string;
  promptText?: string;
  customerConsent: boolean;
  context?: {
    sessionId?: string;
    previousOffers?: Array<{ actor: string; price: number; round: number }>;
    clientIp?: string;
    timestamp?: string;
  };
}

export interface FirewallCheckItem {
  checkId: string;
  name: string;
  description: string;
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  detail: string;
  code?: string;
}

export interface FirewallEvaluation {
  id: string;
  timestamp: string;
  requestId: string;
  agentId: string;
  productId: string;
  proposedPrice: number;
  passed: boolean;
  decision: 'APPROVE' | 'COUNTER' | 'SETTLE' | 'BLOCK';
  checks: FirewallCheckItem[];
  violations: string[];
  signals: string[];
  explanation: string;
  structuredFacts: DecisionFacts;
}

export interface DecisionFacts {
  decision: 'APPROVE' | 'COUNTER' | 'SETTLE' | 'BLOCK';
  productId: string;
  productName: string;
  listedPrice: number;
  proposedPrice: number;
  floorPrice: number;
  discountAmount: number;
  discountPercent: number;
  maxDiscountPercent: number;
  round: number;
  maxRounds: number;
  giftAllowed: boolean;
  giftGranted?: string | null;
  buyerConfirmed: boolean;
  checksPassed: string[];
  checksFailed: string[];
  overrideDetected: boolean;
  overridePatterns?: string[];
  timestamp: string;
}

export interface NegotiationOffer {
  id: string;
  round: number;
  actor: 'BUYER_AGENT' | 'MERCHANT_AGENT' | 'ADVERSARIAL_AGENT' | 'CUSTOMER';
  proposedPrice: number;
  message: string;
  bundleOffered?: string | null;
  policyStatus: 'PASSED' | 'VIOLATION' | 'OVERRIDDEN';
  explanation?: string;
  facts?: DecisionFacts;
  timestamp: string;
}

export interface NegotiationSession {
  id: string;
  productId: string;
  product: Product;
  buyerAgentId: string;
  buyerAgentName: string;
  status: 'ACTIVE' | 'SETTLED' | 'BLOCKED' | 'ABANDONED';
  currentRound: number;
  maxRounds: number;
  listedPrice: number;
  floorPrice: number;
  finalPrice?: number;
  finalDiscountPercent?: number;
  finalBundle?: string | null;
  buyerConfirmed: boolean;
  offers: NegotiationOffer[];
  firewallEvaluations: FirewallEvaluation[];
  orderId?: string;
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NegotiationReceipt {
  receiptId: string;
  orderId: string;
  timestamp: string;
  product: {
    id: string;
    name: string;
    category: string;
    listedPrice: number;
    currency: Currency;
  };
  negotiation: {
    roundsCount: number;
    maxAllowedRounds: number;
    initialBuyerOffer: number;
    finalAgreedPrice: number;
    merchantFloorPrice: number;
    savedAmount: number;
    discountPercent: number;
    maxAllowedDiscountPercent: number;
    bundleGranted?: string | null;
    buyerConfirmed: boolean;
    history: Array<{
      round: number;
      actor: string;
      price: number;
      bundle?: string | null;
    }>;
  };
  policy: {
    status: 'PASSED' | 'POLICY_ENFORCED';
    checksSummary: string[];
    decision: 'SETTLED' | 'APPROVED';
    explanation: string;
    facts: DecisionFacts;
  };
  payment: {
    gateway: 'Razorpay Test Mode';
    orderId: string;
    paymentId: string;
    currency: Currency;
    amountInPaise: number;
    amountInRupees: number;
    status: 'PAID' | 'AUTHORIZED';
    paidAt: string;
    method?: string;
  };
  integrity: {
    algorithm: 'SHA-256';
    canonicalHash: string;
    verified: boolean;
  };
}

export type AuditAction =
  | 'BUYER_AGENT_CONNECTED'
  | 'PRODUCT_SELECTED'
  | 'NEGOTIATION_STARTED'
  | 'BUYER_OFFER_PROPOSED'
  | 'COUNTER_OFFER'
  | 'BUNDLE_GRANTED'
  | 'BUYER_CONFIRMED'
  | 'POLICY_APPROVED'
  | 'POLICY_OVERRIDE_ATTEMPT'
  | 'REQUEST_BLOCKED'
  | 'RAZORPAY_ORDER_CREATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'NEGOTIATION_RECEIPT_CREATED'
  | 'ADVERSARIAL_AGENT_REQUEST'
  | 'ANOMALY_DETECTED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: 'MERCHANT' | 'AGENT_A_LEGITIMATE' | 'AGENT_B_ADVERSARIAL' | 'FIREWALL' | 'POLICY_ENGINE' | 'PAYMENT_SERVICE' | 'CUSTOMER';
  action: AuditAction;
  result: 'SUCCESS' | 'BLOCKED' | 'WARNING' | 'INFO';
  reason: string;
  relatedSessionId?: string;
  relatedOrderId?: string;
  relatedReceiptId?: string;
  metadata?: Record<string, any>;
}

export interface MerchantMetrics {
  totalRevenue: number;
  negotiatedRevenue: number;
  baseCatalogAOV: number;
  negotiatedAOV: number;
  aovUpliftPercent: number;
  totalOrders: number;
  negotiatedOrders: number;
  successfulNegotiationsCount: number;
  negotiationSuccessRatePercent: number;
  policyViolationsCount: number;
  blockedAgentAttemptsCount: number;
  averageDiscountPercent: number;
  bundleAttachmentRatePercent: number;
  isTestMode: boolean;
}
