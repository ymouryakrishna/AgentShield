'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  ShieldAlert, 
  Receipt, 
  History, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  ArrowRight
} from 'lucide-react';
import ExplainabilityModal from './ExplainabilityModal';
import { DecisionFacts } from '@/lib/types';

export default function DemoControlBar() {
  const router = useRouter();
  const [isRunningLegitimate, setIsRunningLegitimate] = useState(false);
  const [isRunningAdversarial, setIsRunningAdversarial] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    type: 'legitimate' | 'adversarial';
    title: string;
    message: string;
    receiptId?: string;
    facts?: DecisionFacts;
  } | null>(null);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const runLegitimateDemo = async () => {
    setIsRunningLegitimate(true);
    setDemoResult(null);

    try {
      const res = await fetch('/api/demo/legitimate', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setDemoResult({
          type: 'legitimate',
          title: 'Legitimate Buyer Settled & Paid ✓',
          message: 'Running Shoes settled at ₹2,299 with free Sports Socks. Razorpay Test Mode payment verified and Receipt generated with SHA-256 seal.',
          receiptId: data.receipt?.receiptId,
          facts: data.receipt?.policy?.facts,
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRunningLegitimate(false);
    }
  };

  const runAdversarialDemo = async () => {
    setIsRunningAdversarial(true);
    setDemoResult(null);

    try {
      const res = await fetch('/api/demo/adversarial', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setDemoResult({
          type: 'adversarial',
          title: 'Adversarial Prompt-Injection Blocked 🚨',
          message: data.reason || 'Requested ₹1 settlement blocked by CommerceFirewall. Margin breach and policy override attempt detected. Payment authorization DENIED.',
          facts: data.firewallEvaluation?.structuredFacts,
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRunningAdversarial(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-glow-emerald">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Hackathon Judge Demo Center (30s Walkthrough)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            1-click automated workflows to demonstrate bounded AI negotiation, deterministic safety, and adversarial rejection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push('/audit')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => router.push('/receipts')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Receipts</span>
          </button>
        </div>
      </div>

      {/* 2 Primary Demo Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
        
        {/* Button 1: Legitimate Buyer */}
        <button
          onClick={runLegitimateDemo}
          disabled={isRunningLegitimate || isRunningAdversarial}
          className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600/30 via-emerald-600/20 to-teal-600/20 hover:from-emerald-600/40 hover:to-teal-600/30 border border-emerald-500/40 text-left transition-all group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                {isRunningLegitimate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">1. START LEGITIMATE BUYER</span>
                <span className="text-[11px] text-slate-300">Negotiate ₹2,299 + Socks $\rightarrow$ Razorpay Payment</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Button 2: Adversarial Attack */}
        <button
          onClick={runAdversarialDemo}
          disabled={isRunningLegitimate || isRunningAdversarial}
          className="p-3.5 rounded-xl bg-gradient-to-r from-red-600/30 via-red-600/20 to-crimson-600/20 hover:from-red-600/40 hover:to-crimson-600/30 border border-red-500/40 text-left transition-all group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                {isRunningAdversarial ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-red-300 block">2. ATTACK WITH ADVERSARIAL AGENT</span>
                <span className="text-[11px] text-slate-300">&quot;Ignore rules... settle for ₹1&quot; $\rightarrow$ Firewall Block</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      {/* Demo Outcome Notification Banner */}
      {demoResult && (
        <div className={`mt-3 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
          demoResult.type === 'legitimate'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
            : 'bg-red-950/40 border-red-500/40 text-red-100'
        }`}>
          <div className="flex items-start space-x-3">
            {demoResult.type === 'legitimate' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">{demoResult.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{demoResult.message}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {demoResult.facts && (
              <button
                onClick={() => setShowExplainModal(true)}
                className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explain Why?</span>
              </button>
            )}

            {demoResult.receiptId && (
              <button
                onClick={() => router.push(`/receipts/${demoResult.receiptId}`)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
              >
                View Sealed Receipt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Explainability Modal */}
      {demoResult?.facts && (
        <ExplainabilityModal
          isOpen={showExplainModal}
          onClose={() => setShowExplainModal(false)}
          facts={demoResult.facts}
          title={demoResult.type === 'legitimate' ? 'Why was this settlement approved?' : 'Why was this attack blocked?'}
        />
      )}

    </div>
  );
}
