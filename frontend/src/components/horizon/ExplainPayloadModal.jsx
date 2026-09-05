import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Code, Copy, Check } from 'lucide-react';

export default function ExplainPayloadModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-navy-800 rounded-[20px] shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-navy-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Commerce Firewall Diagnostic Inspection
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Deterministic security analysis and rejection telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-body">
          {/* Diagnostic Key-Values */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Decision</span>
              <p className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">{data.decision || 'BLOCK'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Payment Authorization</span>
              <p className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">{data.paymentAuthorization || 'DENIED'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Target Floor Price</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                ₹{Number(data.merchantFloorPrice || 2200).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Requested Price</span>
              <p className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                ₹{Number(data.requestedPrice || 1).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200">
            <p className="font-semibold">{data.reason || data.gracefulRecoveryMessage}</p>
          </div>

          {/* Raw JSON Viewer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Raw Intercept Payload</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto border border-white/10 max-h-56 leading-relaxed shadow-inner">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-navy-900/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-navy-700 dark:hover:bg-navy-600 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
