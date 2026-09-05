import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  KeyRound, 
  Gauge, 
  Sliders, 
  Scale, 
  Percent, 
  Clock, 
  ShieldOff, 
  CreditCard, 
  UserCheck 
} from 'lucide-react';

const TEN_CHECKS = [
  { id: 'agentIdentity', name: '1. Agent Identity Handshake', icon: Fingerprint, desc: 'Verifies agent registration on merchant whitelist registry.' },
  { id: 'productPermission', name: '2. Product Permission Check', icon: KeyRound, desc: 'Ensures target product is active and permits autonomous negotiation.' },
  { id: 'rateLimit', name: '3. Rate Limiting Protection', icon: Gauge, desc: 'Throttles rogue agents exceeding max 10 requests per minute.' },
  { id: 'merchantPolicy', name: '4. Merchant Policy Envelope', icon: Sliders, desc: 'Validates commerce intent against merchant policy rules.' },
  { id: 'priceBoundary', name: '5. Hard Price Floor Boundary', icon: Scale, desc: 'Strictly blocks any settlement below the merchant cost floor (₹2,200).' },
  { id: 'discountBoundary', name: '6. Max Discount Percentage', icon: Percent, desc: 'Enforces maximum discount ceiling (12%) to protect gross margins.' },
  { id: 'roundBoundary', name: '7. Negotiation Round Cap', icon: Clock, desc: 'Limits multi-turn conversation depth to maximum 3 rounds.' },
  { id: 'promptInjection', name: '8. Prompt-Injection Shield', icon: ShieldOff, desc: 'Scans NLP prompts for override patterns ("ignore instructions", "settle for ₹1").' },
  { id: 'orderValue', name: '9. Order Value Ceiling', icon: CreditCard, desc: 'Caps maximum single-transaction order value to mitigate rogue exposure.' },
  { id: 'customerConsent', name: '10. Explicit Customer Consent', icon: UserCheck, desc: 'Mandates human customer confirmation prior to financial settlement.' },
];

export default function FirewallMatrix({ evaluation }) {
  if (!evaluation) {
    return (
      <div className="p-8 text-center bg-white border border-border rounded-2xl shadow-2xs font-body">
        <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground font-medium">No request evaluated yet. Send an inbound agent commerce payload to inspect.</p>
      </div>
    );
  }

  const checksObj = evaluation.checks || {};
  const isAllowed = evaluation.allowed !== false && evaluation.decision !== 'BLOCK';
  const passedCount = Object.values(checksObj).filter(Boolean).length;
  const totalChecks = 10;

  return (
    <div className="space-y-4 font-body text-foreground">
      
      {/* Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isAllowed 
          ? 'bg-emerald-50 border-emerald-200 shadow-2xs' 
          : 'bg-rose-50 border-rose-200 shadow-2xs'
      }`}>
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isAllowed 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-rose-100 text-rose-700'
          }`}>
            {isAllowed ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isAllowed ? 'PAYMENT AUTHORIZED ✓' : 'REQUEST INTERCEPTED & BLOCKED 🚨'}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">ID: {evaluation.evaluationId || 'FEV-DEMO'}</span>
            </div>
            <p className="text-sm font-semibold text-foreground mt-1">
              {evaluation.explanation || (isAllowed ? 'Approved by Deterministic Policy Engine.' : 'Blocked by Commerce Firewall.')}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">Security Score</span>
          <span className={`text-base font-mono font-bold ${isAllowed ? 'text-emerald-700' : 'text-rose-700'}`}>
            {passedCount} / {totalChecks} Checks Passed
          </span>
        </div>
      </div>

      {/* 10-Check Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TEN_CHECKS.map((check) => {
          const Icon = check.icon;
          const isPassed = checksObj[check.id] !== false;
          const matchingDetail = evaluation.checkDetails?.find(d => 
            d.check?.toLowerCase().includes(check.id.toLowerCase()) || 
            d.check?.toLowerCase().includes(check.name.toLowerCase().substring(3))
          );

          return (
            <div 
              key={check.id}
              className={`p-4 rounded-xl border transition-all ${
                isPassed
                  ? 'bg-white border-border hover:border-foreground/20 shadow-2xs'
                  : 'bg-rose-50/70 border-rose-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-lg ${
                    isPassed 
                      ? 'bg-secondary text-foreground' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{check.name}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">{check.id}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {isPassed ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>PASS</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>FAIL</span>
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {matchingDetail?.message || check.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
