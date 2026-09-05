import { NextRequest, NextResponse } from 'next/server';
import { CommerceFirewall } from '@/lib/firewall';
import { AgentCommerceRequest } from '@/lib/types';
import { AuditLogService } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const request: AgentCommerceRequest = {
      requestId: body.requestId || `REQ-${Date.now().toString(36).toUpperCase()}`,
      agentId: body.agentId || 'agent-a-legitimate',
      agentName: body.agentName,
      intent: body.intent || 'NEGOTIATE',
      productId: body.productId || 'shoe-001',
      proposedPrice: Number(body.proposedPrice) || 2299,
      quantity: Number(body.quantity) || 1,
      round: Number(body.round) || 1,
      requestedBundle: body.requestedBundle,
      promptText: body.promptText || '',
      customerConsent: !!body.customerConsent,
      context: body.context,
    };

    const evaluation = CommerceFirewall.evaluate(request);

    if (!evaluation.passed) {
      AuditLogService.log({
        actor: request.agentId === 'agent-b-adversarial' ? 'AGENT_B_ADVERSARIAL' : 'FIREWALL',
        action: evaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT') ? 'POLICY_OVERRIDE_ATTEMPT' : 'REQUEST_BLOCKED',
        result: 'BLOCKED',
        reason: evaluation.explanation,
        metadata: { violations: evaluation.violations, signals: evaluation.signals },
      });
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'FIREWALL_EVALUATION_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
