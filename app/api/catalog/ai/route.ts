import { NextResponse } from 'next/server';
import { getAICatalogRepresentation } from '@/lib/catalog';

export async function GET() {
  try {
    const aiCatalog = getAICatalogRepresentation();
    return NextResponse.json(aiCatalog, {
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Commerce-Protocol': 'AgentCommerce-v1',
        'X-Shield-Policy-Enforced': 'true',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'CATALOG_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
