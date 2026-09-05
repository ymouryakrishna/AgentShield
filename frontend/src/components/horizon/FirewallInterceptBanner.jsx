import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ChevronRight, HelpCircle, X, CheckCircle2, Lock } from 'lucide-react';
import ExplainPayloadModal from './ExplainPayloadModal';

export default function FirewallInterceptBanner({ interceptData, onDismiss }) {
  const [showModal, setShowModal] = useState(false);

  if (!interceptData) return null;

  const requestedPrice = interceptData.requestedPrice || 1;
  const floorPrice = interceptData.merchantFloorPrice || 2200;
  const signature = 'ignore\\s+(all\\s+)?(previous|prior|system)... | override\\s+minimum\\s+price';
  const discountPercent = '100.0%';
  const allowedCeiling = '12.0%';

  return (
    <>
      <div className="relative overflow-hidden rounded-[20px] border border-rose-500/40 bg-rose-500/10 dark:bg-rose-500/15 p-5 md:p-6 backdrop-blur-xl text-slate-900 dark:text-white shadow-xl shadow-rose-500/5 transition-all animate-in fade-in slide-in-from-top-4">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-rose-500/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  ADVERSARIAL PROMPT-INJECTION BLOCKED
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                  Zero Floor Breach
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                Deterministic Commerce Firewall successfully intercepted an unauthorized price manipulation attack.
              </p>
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="self-end sm:self-center p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Diagnostic Report Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
          
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-navy-900/70 border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              Price Boundary Violation
            </span>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
              Requested: <strong className="text-rose-600 dark:text-rose-400">₹{requestedPrice}</strong> | Authorized Floor: <strong>₹{Number(floorPrice).toLocaleString('en-IN')}</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-navy-900/70 border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              Matched Heuristic Signature
            </span>
            <p className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 mt-1 truncate">
              {signature}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-navy-900/70 border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              Computed Violation Percentage
            </span>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
              Requested discount: <strong className="text-rose-600 dark:text-rose-400">{discountPercent}</strong> | Allowed ceiling: <strong>{allowedCeiling}</strong>
            </p>
          </div>

        </div>

        {/* Status Statement & Explain Why Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-700 dark:text-rose-300">
            <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              Payment authorization DENIED. Transaction halted before payment gateway invocation.
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Explain Why?</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      <ExplainPayloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={interceptData}
      />
    </>
  );
}
