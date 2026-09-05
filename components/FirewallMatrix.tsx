'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
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
import { FirewallEvaluation, FirewallCheckItem } from '@/lib/types';

interface FirewallMatrixProps {
  evaluation: FirewallEvaluation | null;
  interactive?: boolean;
}

const CHECK_ICONS: Record<string, React.ElementType> = {
  CHECK_1_AGENT_IDENTITY: Fingerprint,
  CHECK_2_PRODUCT_PERMISSION: KeyRound,
  CHECK_3_RATE_LIMIT: Gauge,
  CHECK_4_MERCHANT_POLICY: Sliders,
  CHECK_5_PRICE_BOUNDARY: Scale,
  CHECK_6_DISCOUNT_BOUNDARY: Percent,
  CHECK_7_ROUND_BOUNDARY: Clock,
  CHECK_8_PROMPT_INJECTION_SHIELD: ShieldOff,
  CHECK_9_ORDER_VALUE: CreditCard,
  CHECK_10_CUSTOMER_CONSENT: UserCheck,
};

export default function FirewallMatrix({ evaluation }: FirewallMatrixProps) {
  if (!evaluation) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-medium">No request evaluated yet. Send an inbound agent commerce payload to inspect.</p>
      </div>
    );
  }

  const passedCount = evaluation.checks.filter(c => c.passed).length;
  const totalChecks = evaluation.checks.length;

  return (
    <div className="space-y-4">
      
      {/* Firewall Evaluation Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        evaluation.passed 
          ? 'bg-emerald-950/30 border-emerald-500/30 shadow-glow-emerald' 
          : 'bg-red-950/40 border-red-500/40 shadow-glow-crimson'
      }`}>
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            evaluation.passed 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}>
            {evaluation.passed ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                evaluation.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {evaluation.passed ? 'PAYMENT AUTHORIZED ✓' : 'REQUEST BLOCKED 🚨'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {evaluation.id}</span>
            </div>
            <p className="text-sm font-semibold text-white mt-1">
              {evaluation.explanation}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">Security Score</span>
          <span className={`text-lg font-mono font-bold ${evaluation.passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {passedCount} / {totalChecks} Checks Passed
          </span>
        </div>
      </div>

      {/* 10-Check Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {evaluation.checks.map((check) => {
          const Icon = CHECK_ICONS[check.checkId] || ShieldCheck;
          return (
            <div 
              key={check.checkId}
              className={`p-4 rounded-xl border transition-all ${
                check.passed
                  ? 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  : 'bg-red-950/30 border-red-500/50 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-lg ${
                    check.passed 
                      ? 'bg-slate-800 text-emerald-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{check.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{check.checkId}</span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  check.passed
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {check.passed ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>PASS</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>FAIL</span>
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {check.detail}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
