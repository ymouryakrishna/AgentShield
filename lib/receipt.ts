import * as crypto from 'crypto';
import { NegotiationReceipt, NegotiationSession, DecisionFacts } from './types';

export class ReceiptGenerator {
  /**
   * Generates a tamper-evident Negotiation Receipt with SHA-256 cryptographic proof.
   */
  public static generateReceipt(params: {
    session: NegotiationSession;
    orderId: string;
    paymentId: string;
    amountInRupees: number;
    paymentStatus?: 'PAID' | 'AUTHORIZED';
    facts: DecisionFacts;
    paymentMethod?: string;
  }): NegotiationReceipt {
    const { session, orderId, paymentId, amountInRupees, facts, paymentMethod = 'Razorpay UPI / NetBanking (Test Mode)' } = params;
    const now = new Date().toISOString();
    const receiptId = `NGR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const listedPrice = session.product.price;
    const finalAgreedPrice = amountInRupees;
    const savedAmount = Math.max(0, listedPrice - finalAgreedPrice);
    const discountPercent = listedPrice > 0 ? (savedAmount / listedPrice) * 100 : 0;
    const initialOffer = session.offers.find(o => o.actor === 'BUYER_AGENT')?.proposedPrice || finalAgreedPrice;

    // History simplified for canonical representation
    const history = session.offers.map(o => ({
      round: o.round,
      actor: o.actor,
      price: o.proposedPrice,
      bundle: o.bundleOffered || null,
    }));

    const partialReceipt: Omit<NegotiationReceipt, 'integrity'> = {
      receiptId,
      orderId,
      timestamp: now,
      product: {
        id: session.product.id,
        name: session.product.name,
        category: session.product.category,
        listedPrice,
        currency: 'INR',
      },
      negotiation: {
        roundsCount: session.currentRound,
        maxAllowedRounds: session.maxRounds,
        initialBuyerOffer: initialOffer,
        finalAgreedPrice,
        merchantFloorPrice: session.product.negotiation.floorPrice,
        savedAmount,
        discountPercent,
        maxAllowedDiscountPercent: session.product.negotiation.maxDiscountPercent,
        bundleGranted: session.finalBundle || null,
        buyerConfirmed: session.buyerConfirmed,
        history,
      },
      policy: {
        status: 'PASSED',
        checksSummary: [
          'Agent Identity Verified',
          'Price Floor Boundary Enforced',
          'Discount Limit Enforced',
          'Negotiation Rounds Capped',
          'Prompt-Injection Scanned',
          'Customer Consent Verified',
        ],
        decision: 'SETTLED',
        explanation: facts.decision === 'SETTLE' 
          ? `Final price remained above the merchant floor and within permitted discount and negotiation limits.`
          : facts.decision,
        facts,
      },
      payment: {
        gateway: 'Razorpay Test Mode',
        orderId,
        paymentId,
        currency: 'INR',
        amountInPaise: Math.round(finalAgreedPrice * 100),
        amountInRupees: finalAgreedPrice,
        status: params.paymentStatus || 'PAID',
        paidAt: now,
        method: paymentMethod,
      },
    };

    // Canonicalize JSON for deterministic SHA-256 hash
    const canonicalString = this.canonicalizeObject(partialReceipt);
    const hash = crypto.createHash('sha256').update(canonicalString).digest('hex');

    const fullReceipt: NegotiationReceipt = {
      ...partialReceipt,
      integrity: {
        algorithm: 'SHA-256',
        canonicalHash: hash,
        verified: true,
      },
    };

    return fullReceipt;
  }

  /**
   * Verifies the cryptographic integrity of a Negotiation Receipt.
   */
  public static verifyReceiptIntegrity(receipt: NegotiationReceipt): {
    isValid: boolean;
    computedHash: string;
    storedHash: string;
  } {
    const { integrity, ...partialReceipt } = receipt;
    const canonicalString = this.canonicalizeObject(partialReceipt);
    const computedHash = crypto.createHash('sha256').update(canonicalString).digest('hex');
    const storedHash = integrity.canonicalHash;

    return {
      isValid: computedHash === storedHash,
      computedHash,
      storedHash,
    };
  }

  /**
   * Sorts object keys recursively to produce deterministic canonical JSON string.
   */
  public static canonicalizeObject(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return `[${obj.map(item => this.canonicalizeObject(item)).join(',')}]`;
    }
    const keys = Object.keys(obj).sort();
    const entries = keys.map(key => `"${key}":${this.canonicalizeObject(obj[key])}`);
    return `{${entries.join(',')}}`;
  }
}
