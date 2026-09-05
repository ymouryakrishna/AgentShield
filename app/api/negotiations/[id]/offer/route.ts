import { NextRequest, NextResponse } from 'next/server';
import { BoundedNegotiationEngine } from '@/lib/negotiation';
import { StoreService } from '@/lib/store';
import { AuditLogService } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { 
      proposedPrice, 
      promptText = '', 
      customerConsent = false, 
      intent = 'NEGOTIATE' 
    } = body;

    let session = StoreService.getSession(sessionId);

    // If session was not found in memory, create or recover a default session for seamless testing
    if (!session) {
      const { getProductById } = await import('@/lib/catalog');
      const defaultProduct = getProductById(body.productId || 'shoe-001')!;
      session = BoundedNegotiationEngine.createSession(
        defaultProduct, 
        body.buyerAgentId || 'agent-a-legitimate'
      );
      session.id = sessionId;
      StoreService.saveSession(session);
    }

    if (typeof proposedPrice !== 'number' || isNaN(proposedPrice)) {
      return NextResponse.json(
        { success: false, code: 'INVALID_PRICE', message: 'Proposed price must be a valid number.' },
        { status: 400 }
      );
    }

    const result = BoundedNegotiationEngine.processBuyerOffer(
      session,
      proposedPrice,
      promptText,
      customerConsent,
      intent
    );

    StoreService.saveSession(result.session);

    // Log corresponding audit events
    if (result.status === 'BLOCKED') {
      const isOverride = result.firewallEvaluation.signals.includes('POLICY_OVERRIDE_ATTEMPT');
      
      AuditLogService.log({
        actor: session.buyerAgentId === 'agent-b-adversarial' ? 'AGENT_B_ADVERSARIAL' : 'AGENT_A_LEGITIMATE',
        action: session.buyerAgentId === 'agent-b-adversarial' ? 'ADVERSARIAL_AGENT_REQUEST' : 'BUYER_OFFER_PROPOSED',
        result: 'WARNING',
        reason: `Buyer offer proposal: ₹${proposedPrice} with prompt "${promptText}"`,
        relatedSessionId: session.id,
        metadata: { proposedPrice, promptText },
      });

      if (isOverride) {
        AuditLogService.log({
          actor: 'FIREWALL',
          action: 'POLICY_OVERRIDE_ATTEMPT',
          result: 'BLOCKED',
          reason: `Detected adversarial override pattern: ${result.firewallEvaluation.violations.join(', ')}`,
          relatedSessionId: session.id,
          metadata: { violations: result.firewallEvaluation.violations },
        });
      }

      AuditLogService.log({
        actor: 'FIREWALL',
        action: 'REQUEST_BLOCKED',
        result: 'BLOCKED',
        reason: result.message,
        relatedSessionId: session.id,
        metadata: { proposedPrice, floorPrice: session.product.negotiation.floorPrice },
      });
    } else {
      AuditLogService.log({
        actor: 'AGENT_A_LEGITIMATE',
        action: 'BUYER_OFFER_PROPOSED',
        result: 'SUCCESS',
        reason: `Buyer offered ₹${proposedPrice.toLocaleString('en-IN')} in round ${result.session.currentRound}.`,
        relatedSessionId: session.id,
        metadata: { proposedPrice, round: result.session.currentRound },
      });

      if (result.status === 'COUNTERED') {
        const lastOffer = result.session.offers[result.session.offers.length - 1];
        AuditLogService.log({
          actor: 'MERCHANT',
          action: 'COUNTER_OFFER',
          result: 'INFO',
          reason: `Merchant counteroffered ₹${lastOffer.proposedPrice.toLocaleString('en-IN')}${lastOffer.bundleOffered ? ` + ${lastOffer.bundleOffered}` : ''}`,
          relatedSessionId: session.id,
          metadata: { counterPrice: lastOffer.proposedPrice, bundle: lastOffer.bundleOffered },
        });

        if (lastOffer.bundleOffered) {
          AuditLogService.log({
            actor: 'POLICY_ENGINE',
            action: 'BUNDLE_GRANTED',
            result: 'SUCCESS',
            reason: `Bundle eligibility met: ${lastOffer.bundleOffered}`,
            relatedSessionId: session.id,
            metadata: { bundle: lastOffer.bundleOffered },
          });
        }
      }
    }

    return NextResponse.json({
      success: result.status !== 'BLOCKED',
      status: result.status,
      session: result.session,
      firewallEvaluation: result.firewallEvaluation,
      message: result.message,
      suggestedAction: result.suggestedAction,
      policyFacts: result.policyFacts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'OFFER_PROCESS_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
