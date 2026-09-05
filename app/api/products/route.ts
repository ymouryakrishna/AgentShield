import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/catalog';

export async function GET() {
  try {
    const products = getAllProducts();
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
