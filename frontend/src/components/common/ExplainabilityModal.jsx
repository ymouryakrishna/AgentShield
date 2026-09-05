import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Code, 
  Sparkles,
  Clock 
} from 'lucide-react';

export default function ExplainabilityModal({
  isOpen,
  onClose,
  facts,
  title
}) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !facts) return null;

  const isApproved = facts.decision === 'APPROVE' || facts.decision === 'SETTLE';
  const isBlocked = facts.decision === 'BLOCK';

  const bulletPoints = [];
  const priceOk = facts.proposedPrice >= facts.floorPrice;
  bulletPoints.push({
    passed: priceOk,
    text: priceOk
      ? `Proposed price (₹${Number(facts.proposedPrice).toLocaleString('en-IN')}) is >= merchant floor (₹${Number(facts.floorPrice).toLocaleString('en-IN')})`
      : `Proposed price (₹${Number(facts.proposedPrice).toLocaleString('en-IN')}) is below merchant floor (₹${Number(facts.floorPrice).toLocaleString('en-IN')})`
  });

  const discountOk = facts.discountPercent <= (facts.maxDiscountPercent || 12) + 0.01;
  bulletPoints.push({
    passed: discountOk,
    text: discountOk
      ? `Discount (${Number(facts.discountPercent || 0).toFixed(1)}%) is within max limit (${Number(facts.maxDiscountPercent || 12).toFixed(1)}%)`
      : `Discount (${Number(facts.discountPercent || 0).toFixed(1)}%) exceeds limit (${Number(facts.maxDiscountPercent || 12).toFixed(1)}%)`
  });

  const roundOk = (facts.round || 1) <= (facts.maxRounds || 3);
  bulletPoints.push({
    passed: roundOk,
    text: roundOk
      ? `Negotiation round (${facts.round || 1}/${facts.maxRounds || 3}) within permitted limit`
      : `Exceeded maximum rounds (${facts.round} > ${facts.maxRounds || 3})`
  });

  bulletPoints.push({
    passed: !facts.overrideDetected,
    text: !facts.overrideDetected
      ? 'No prompt injection or merchant policy override detected'
      : `Policy override attempt detected: ${facts.overridePatterns?.join(', ') || 'Adversarial override signature'}`
  });

  if (facts.giftGranted || facts.bundleGranted) {
    const gift = facts.giftGranted || facts.bundleGranted;
    bulletPoints.push({
      passed: facts.giftAllowed !== false,
      text: `Complimentary bundle grant verified: ${gift}`
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-2xl bg-white border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-foreground font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isApproved 
            ? 'bg-emerald-50/60 border-emerald-100' 
            : isBlocked 
            ? 'bg-rose-50/60 border-rose-100' 
            : 'bg-secondary/60 border-border'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isApproved 
                ? 'bg-emerald-100 text-emerald-700' 
                : isBlocked 
                ? 'bg-rose-100 text-rose-700' 
                : 'bg-accent/10 text-accent'
            }`}>
              {isApproved ? (
                <ShieldCheck className="w-5 h-5" />
              ) : isBlocked ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-display text-2xl text-foreground font-medium">
                {title || (isApproved ? 'Why was this approved?' : isBlocked ? 'Why was this blocked?' : 'Decision Policy Evaluation')}
              </h3>
              <p className="text-xs text-muted-foreground">
                Deterministic structured explanation derived by AgentShield Policy Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Plain-English Explanation */}
          <div className={`p-4 rounded-xl border ${
            isApproved 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : isBlocked 
              ? 'bg-rose-50/80 border-rose-200 text-rose-900' 
              : 'bg-secondary/70 border-border text-foreground'
          }`}>
            <div className="flex items-start space-x-2.5">
              <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
                isApproved ? 'text-emerald-600' : isBlocked ? 'text-rose-600' : 'text-accent'
              }`} />
              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider opacity-75 mb-1">
                  Plain-English Factual Explanation (Zero Hallucination)
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {facts.explanation || (isApproved
                    ? `Approved because ₹${Number(facts.proposedPrice).toLocaleString('en-IN')} is above the merchant's ₹${Number(facts.floorPrice || 2200).toLocaleString('en-IN')} floor, the ${Number(facts.discountPercent || 0).toFixed(1)}% discount is within the allowed ${Number(facts.maxDiscountPercent || 12).toFixed(1)}% limit, the negotiation remained within ${facts.round || 1} of ${facts.maxRounds || 3} allowed rounds${facts.giftGranted || facts.bundleGranted ? `, and the order qualified for complimentary bundle gift (${facts.giftGranted || facts.bundleGranted})` : ''}.`
                    : isBlocked
                    ? `Blocked because ${facts.overrideDetected ? `a policy override attempt was detected` : ''}${facts.overrideDetected && facts.proposedPrice < facts.floorPrice ? ' and ' : ''}${facts.proposedPrice < facts.floorPrice ? `requested price ₹${Number(facts.proposedPrice).toLocaleString('en-IN')} is below the merchant floor of ₹${Number(facts.floorPrice).toLocaleString('en-IN')}` : ''}${facts.discountPercent > facts.maxDiscountPercent ? `, discount of ${Number(facts.discountPercent).toFixed(1)}% exceeds maximum allowed ${Number(facts.maxDiscountPercent).toFixed(1)}%` : ''}.`
                    : `Counteroffer generated within bounded policy envelope.`)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium">Proposed Price</span>
              <p className="text-base font-bold text-foreground mt-0.5 font-mono">₹{Number(facts.proposedPrice || 0).toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-muted-foreground">List: ₹{Number(facts.listedPrice || 2499).toLocaleString('en-IN')}</span>
            </div>

            <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium">Merchant Floor</span>
              <p className="text-base font-bold text-foreground mt-0.5 font-mono">₹{Number(facts.floorPrice || 2200).toLocaleString('en-IN')}</p>
              <span className={`text-[10px] font-semibold ${facts.proposedPrice >= (facts.floorPrice || 2200) ? 'text-emerald-600' : 'text-rose-600'}`}>
                {facts.proposedPrice >= (facts.floorPrice || 2200) ? '✓ Floor Satisfied' : '✗ Below Floor'}
              </span>
            </div>

            <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium">Discount</span>
              <p className="text-base font-bold text-foreground mt-0.5">{Number(facts.discountPercent || 0).toFixed(1)}%</p>
              <span className="text-[10px] text-muted-foreground">Cap: {Number(facts.maxDiscountPercent || 12).toFixed(1)}%</span>
            </div>

            <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium">Round Progress</span>
              <p className="text-base font-bold text-foreground mt-0.5">Round {facts.round || 1} / {facts.maxRounds || 3}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Within Limit</span>
            </div>
          </div>

          {/* Policy Matrix Checks */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2.5">
              Deterministic Policy Matrix
            </h4>
            <div className="space-y-2">
              {bulletPoints.map((point, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start space-x-2.5 p-3 rounded-lg border text-xs ${
                    point.passed 
                      ? 'bg-secondary/30 border-border/80 text-foreground' 
                      : 'bg-rose-50/80 border-rose-200 text-rose-900 font-medium'
                  }`}
                >
                  {point.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Facts Toggle */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Structured Decision Facts JSON' : 'View Structured Decision Facts JSON'}</span>
            </button>

            {showRawJson && (
              <pre className="mt-2.5 p-3.5 rounded-xl bg-secondary/80 border border-border text-[11px] font-mono text-foreground overflow-x-auto">
                {JSON.stringify(facts, null, 2)}
              </pre>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/40 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>AI proposes. Merchant policy decides.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
