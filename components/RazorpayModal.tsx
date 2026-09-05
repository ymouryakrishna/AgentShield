'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  QrCode, 
  Smartphone, 
  Building2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amountInRupees: number;
  productName: string;
  bundleAttached?: string | null;
  policyAuthorizationToken: string;
  sessionId: string;
  onSuccess: (data: { orderId: string; paymentId: string; receipt: any }) => void;
}

export default function RazorpayModal({
  isOpen,
  onClose,
  orderId,
  amountInRupees,
  productName,
  bundleAttached,
  policyAuthorizationToken,
  sessionId,
  onSuccess,
}: RazorpayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate real Razorpay checkout completion
      const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 9)}`;
      
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentId: testPaymentId,
          signature: 'test_verified_signature',
          sessionId,
          amountInRupees,
          paymentMethod: selectedMethod === 'upi' ? 'Razorpay UPI (Test Mode)' : 'Razorpay Card (Test Mode)',
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // Trigger celebratory confetti for verified settlement
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3395FF', '#F59E0B']
          });
        } catch (e) {
          // ignore in headless
        }

        onSuccess({
          orderId,
          paymentId: testPaymentId,
          receipt: verifyData.receipt,
        });
      } else {
        setErrorMessage(verifyData.message || 'Payment signature verification failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Test Mode Header */}
        <div className="bg-[#0C2340] p-4 text-white flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-black text-white text-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white">Razorpay</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-500/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-[10px] text-slate-300">AgentShield Verified Payment Gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary & Security Token Gate */}
        <div className="p-5 space-y-4">
          
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Order Amount</span>
              <p className="text-xl font-extrabold text-emerald-400">₹{amountInRupees.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">{productName}</span>
              {bundleAttached && (
                <span className="text-[10px] text-emerald-300 font-semibold block">
                  + {bundleAttached} (Free Gift)
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono block">Order ID</span>
              <span className="text-xs text-slate-300 font-mono font-medium truncate max-w-[120px] block">
                {orderId}
              </span>
            </div>
          </div>

          {/* Security Gate Badge */}
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center space-x-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block">Policy Engine Gate: AUTHORIZED ✓</span>
              <span className="text-[10px] text-slate-400 font-mono truncate block">
                {policyAuthorizationToken}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Select Test Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedMethod('upi')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                  selectedMethod === 'upi'
                    ? 'bg-blue-500/20 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-semibold">UPI / QR</span>
              </button>

              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-blue-500/20 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-semibold">Test Card</span>
              </button>

              <button
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'bg-blue-500/20 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-semibold">NetBanking</span>
              </button>
            </div>
          </div>

          {/* Test Card / UPI simulated hint */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Test Mode Sandbox Auto-Authorization</span>
            <span className="font-mono text-emerald-400 font-bold">READY</span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3 bg-[#3395FF] hover:bg-[#2884E0] disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Test Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{amountInRupees.toLocaleString('en-IN')} (Razorpay Test Mode)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            No real money is charged. This transaction uses verified Razorpay Test Mode semantics.
          </p>

        </div>

      </div>
    </div>
  );
}
