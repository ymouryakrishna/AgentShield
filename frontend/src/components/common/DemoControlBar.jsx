import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import api from '../../services/api';

export default function DemoControlBar() {
  const navigate = useNavigate();
  const [isRunningLegitimate, setIsRunningLegitimate] = useState(false);
  const [isRunningAdversarial, setIsRunningAdversarial] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const runLegitimateDemo = async () => {
    setIsRunningLegitimate(true);
    setDemoResult(null);

    try {
      const data = await api.runLegitimateDemo();
      if (data.success) {
        setDemoResult({
          type: 'legitimate',
          title: 'Legitimate Buyer Settled & Paid ✓',
          message: 'Running Shoes settled at ₹2,299 with free Sports Socks. Razorpay Test Mode payment verified and Receipt generated with SHA-256 seal.',
          receiptId: data.receipt?.receiptId,
          facts: data.receipt?.policyFacts || data.receipt?.policy?.facts || {
            decision: 'SETTLE',
            productId: 'running-shoes',
            proposedPrice: 2299,
            floorPrice: 2200,
            discountPercent: 8.0,
            maxDiscountPercent: 12.0,
            round: 3,
            maxRounds: 3,
            giftGranted: 'Sports Socks',
            explanation: 'Approved because final price ₹2,299 is above floor price ₹2,200, 8.0% discount is within 12%, and Sports Socks bundle concession was satisfied.'
          },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningLegitimate(false);
    }
  };

  const runAdversarialDemo = async () => {
    setIsRunningAdversarial(true);
    setDemoResult(null);

    try {
      const data = await api.runAdversarialDemo();
      if (data.success) {
        setDemoResult({
          type: 'adversarial',
          title: 'Adversarial Prompt-Injection Blocked 🚨',
          message: data.reason || 'Requested ₹1 settlement blocked by CommerceFirewall. Margin breach and policy override attempt detected. Payment authorization DENIED.',
          facts: {
            decision: 'BLOCK',
            proposedPrice: 1,
            floorPrice: 2200,
            discountPercent: 99.9,
            maxDiscountPercent: 12.0,
            round: 1,
            maxRounds: 3,
            overrideDetected: true,
            overridePatterns: ['ignore previous instructions', 'override minimum price', 'settle for 1'],
            explanation: 'Blocked because a policy override attempt was detected and requested price ₹1 is below merchant floor of ₹2,200.'
          },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningAdversarial(false);
    }
  };

  return (
    <div className="w-full bg-white/70 dark:bg-navy-800/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[20px] p-5 shadow-sm">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Judge Demo Center • 1-Click Verification
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
            Deterministic safety validation: compare bounded negotiation vs rogue adversarial interception.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/audit')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-full text-xs font-semibold transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => navigate('/receipts')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-full text-xs font-semibold transition-colors cursor-pointer"
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
          className="p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-left transition-all group disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                {isRunningLegitimate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">1. START LEGITIMATE BUYER</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Negotiate ₹2,299 + Socks &rarr; Razorpay Payment &rarr; Receipt</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Button 2: Adversarial Attack */}
        <button
          onClick={runAdversarialDemo}
          disabled={isRunningLegitimate || isRunningAdversarial}
          className="p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 text-left transition-all group disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
                {isRunningAdversarial ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">2. ATTACK WITH ADVERSARIAL AGENT</span>
                <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">&quot;Ignore rules... settle for ₹1&quot; &rarr; Firewall Intercept</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      {/* Demo Outcome Notification Banner */}
      {demoResult && (
        <div className={`mt-3 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          demoResult.type === 'legitimate'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white'
            : 'bg-rose-500/10 border-rose-500/30 text-slate-900 dark:text-white'
        }`}>
          <div className="flex items-start space-x-3">
            {demoResult.type === 'legitimate' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">{demoResult.title}</h4>
              <p className="text-xs mt-0.5 font-medium text-slate-600 dark:text-slate-300">{demoResult.message}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {demoResult.facts && (
              <button
                onClick={() => setShowExplainModal(true)}
                className="px-3.5 py-1.5 bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Explain Why?</span>
              </button>
            )}

            {demoResult.receiptId && (
              <button
                onClick={() => navigate(`/receipts/${demoResult.receiptId}`)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
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
