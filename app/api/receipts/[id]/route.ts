import { NextRequest, NextResponse } from 'next/server';
import { StoreService } from '@/lib/store';
import { ReceiptGenerator } from '@/lib/receipt';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptId = params.id;
    const receipt = StoreService.getReceipt(receiptId);

    if (!receipt) {
      return NextResponse.json(
        { success: false, code: 'RECEIPT_NOT_FOUND', message: `Receipt ${receiptId} not found.` },
        { status: 404 }
      );
    }

    const integrityCheck = ReceiptGenerator.verifyReceiptIntegrity(receipt);

    return NextResponse.json({
      success: true,
      receipt,
      integrityCheck,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'RECEIPT_FETCH_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
