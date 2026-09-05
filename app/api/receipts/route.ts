import { NextResponse } from 'next/server';
import { StoreService } from '@/lib/store';

export async function GET() {
  try {
    const receipts = StoreService.getAllReceipts();
    return NextResponse.json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'RECEIPTS_FETCH_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
