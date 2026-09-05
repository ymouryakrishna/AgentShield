import React from 'react';
import { 
  ShieldCheck, 
  Bot, 
  Sliders, 
  CreditCard, 
  Receipt, 
  X, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-body animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-white/10 rounded-[20px] shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">AgentShield Architecture</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                The Trust Layer for AI-Agent Commerce
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Architecture Flow */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Core 4-Stage Financial Security Pipeline:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50/80 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>1. AI Proposes</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Autonomous buyer agents discover catalog inventory and propose multi-turn offers within bounded rounds.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>2. Policy Decides</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                CommerceFirewall executes 10 deterministic checks, enforces hard floor prices, and detects prompt injections.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>3. Razorpay Executes</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Payment requires a cryptographically signed Policy Authorization Token and explicit human customer consent.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">4</span>
                <span>4. The Receipt Proves Why</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Every settlement generates an immutable SHA-256 canonical receipt and transparent explainability audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-bold">Zero AI Direct Payment Access:</strong> LLMs cannot trigger payment APIs directly without passing through deterministic policy verification.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
          >
            Got it, continue
          </button>
        </div>

      </div>
    </div>
  );
}
