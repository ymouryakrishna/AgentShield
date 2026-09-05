import { NextResponse } from 'next/server';
import { StoreService } from '@/lib/store';

export async function GET() {
  try {
    const metrics = StoreService.getMetrics();
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'METRICS_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
