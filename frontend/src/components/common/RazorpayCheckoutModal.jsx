import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  X, 
  Loader2, 
  Lock, 
  Smartphone, 
  Building2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  orderId,
  amountInRupees,
  productName,
  bundleAttached,
  policyAuthorizationToken,
  sessionId,
  onSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 9)}`;
      
      const verifyData = await api.verifyPayment({
        orderId,
        paymentId: testPaymentId,
        signature: 'test_verified_signature',
        sessionId,
        amountInRupees,
        paymentMethod: selectedMethod === 'upi' ? 'Razorpay UPI (Test Mode)' : 'Razorpay Card (Test Mode)',
      });

      if (verifyData.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4F46E5', '#10B981', '#F59E0B']
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
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-white border border-border rounded-2xl shadow-2xl overflow-hidden font-body text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Test Mode Header */}
        <div className="bg-[#0C2340] p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-bold text-white text-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white">Razorpay</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-[10px] text-slate-300">AgentShield Verified Payment Gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary & Security Token Gate */}
        <div className="p-5 space-y-4">
          
          <div className="p-3.5 bg-secondary/50 border border-border rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Order Amount</span>
              <p className="text-xl font-bold text-foreground font-mono">₹{Number(amountInRupees).toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-muted-foreground block mt-0.5">{productName}</span>
              {bundleAttached && (
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  + {bundleAttached} (Free Gift)
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-mono block">Order ID</span>
              <span className="text-xs text-foreground font-mono font-medium truncate max-w-[120px] block">
                {orderId}
              </span>
            </div>
          </div>

          {/* Security Gate Badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block text-[11px]">Policy Engine Gate: AUTHORIZED ✓</span>
              <span className="text-[10px] text-emerald-700 font-mono truncate block">
                {policyAuthorizationToken}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Select Test Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedMethod('upi')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  selectedMethod === 'upi'
                    ? 'bg-accent/10 border-accent text-accent font-semibold shadow-2xs'
                    : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-4 h-4 text-accent" />
                <span className="text-[11px]">UPI / QR</span>
              </button>

              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-accent/10 border-accent text-accent font-semibold shadow-2xs'
                    : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="w-4 h-4 text-accent" />
                <span className="text-[11px]">Test Card</span>
              </button>

              <button
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  selectedMethod === 'netbanking'
                    ? 'bg-accent/10 border-accent text-accent font-semibold shadow-2xs'
                    : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-4 h-4 text-accent" />
                <span className="text-[11px]">NetBanking</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3 bg-[#3395FF] hover:bg-[#2884E0] disabled:opacity-50 text-white font-semibold rounded-full shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Test Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{Number(amountInRupees).toLocaleString('en-IN')} (Razorpay Test Mode)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            No real money is charged. Backend strictly requires Policy Authorization Token.
          </p>

        </div>

      </div>
    </div>
  );
}
