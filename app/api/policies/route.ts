import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/catalog';

export async function GET() {
  const products = getAllProducts();
  const policyEnvelopes = products.map(p => ({
    productId: p.id,
    productName: p.name,
    listedPrice: p.price,
    floorPrice: p.negotiation.floorPrice,
    maxDiscountPercent: p.negotiation.maxDiscountPercent,
    maxRounds: p.negotiation.maxRounds,
    allowBundles: p.negotiation.allowBundles,
    bundle: p.negotiation.bundle,
    requireCustomerConfirmation: p.negotiation.requireCustomerConfirmation,
    maxOrderValue: p.negotiation.maxOrderValue,
  }));

  return NextResponse.json({
    success: true,
    merchantName: 'AgentShield Athletic Goods',
    globalConstraints: {
      currency: 'INR',
      maxGlobalOrderValue: 100000,
      promptInjectionDefense: 'STRICT_DETERMINISTIC_V1',
      customerConfirmationMandatory: true,
      maxGlobalRounds: 5,
    },
    productEnvelopes: policyEnvelopes,
  });
}
