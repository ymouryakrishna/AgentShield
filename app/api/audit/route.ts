import { NextRequest, NextResponse } from 'next/server';
import { AuditLogService } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actor = searchParams.get('actor') || undefined;
    const result = searchParams.get('result') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const events = AuditLogService.getEvents({ actor, result, action, limit });

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'AUDIT_FETCH_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
