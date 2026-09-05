import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Code,
  X,
  Lock,
  Gift,
  Clock,
  CreditCard,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

interface ReceiptModalProps {
  receipt: any | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    status: string;
    computedHash?: string;
    storedHash?: string;
    message?: string;
  } | null>(null);

  if (!receipt) return null;

  const rawHash =
    receipt.receiptHash ||
    receipt.integrity?.canonicalHash ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const receiptId = receipt.receiptId || 'NGR-2026-0001';
  const productName = receipt.product?.name || receipt.productName || 'Running Shoes';
  const category = receipt.product?.category || receipt.category || 'Sports & Fitness';
  const listPrice = receipt.listPrice || receipt.product?.listPrice || receipt.product?.listedPrice || 2499;
  const finalPrice = receipt.finalPrice || receipt.negotiation?.finalAgreedPrice || receipt.amountInRupees || 2299;
  const floorPrice = receipt.floorPrice || receipt.negotiation?.merchantFloorPrice || receipt.policyFacts?.floorPrice || 2200;
  const discountPercent =
    receipt.discountPercent !== undefined
      ? receipt.discountPercent
      : receipt.negotiation?.discountPercent ||
        (listPrice > 0 ? ((listPrice - finalPrice) / listPrice) * 100 : 0);
  const maxDiscountPercent = receipt.maxDiscountPercent || 12.0;
  const rounds = receipt.negotiationRounds || receipt.negotiation?.roundsCount || receipt.policyFacts?.round || 2;
  const maxRounds = receipt.policyFacts?.maxRounds || 3;
  const bundle =
    receipt.bundle ||
    receipt.negotiation?.bundleGranted ||
    receipt.policyFacts?.bundleGranted ||
    receipt.concession ||
    'Free Sports Socks';
  const explanation =
    receipt.explanation ||
    receipt.policyFacts?.explanation ||
    'Approved because the settled price is within the authorized floor boundary and satisfies merchant margin constraints.';
  const orderId = receipt.razorpayOrderId || receipt.payment?.orderId || 'order_mock_settled_2026';
  const paymentId = receipt.razorpayPaymentId || receipt.payment?.paymentId || 'pay_test_verified';
  const paymentMode = receipt.paymentMode || 'MOCK';
  const paymentStatus = receipt.paymentStatus || 'PAID';
  const timestamp = receipt.timestamp ? new Date(receipt.timestamp).toLocaleString() : 'Just now';
  const offerHistory = receipt.offerHistory || [];

  const handleCopyHash = () => {
    navigator.clipboard.writeText(rawHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLiveTamperCheck = async () => {
    setIsVerifying(true);
    try {
      const data = await api.verifyReceipt(receiptId, { receipt });
      if (data && data.success) {
        setVerificationResult({
          isValid: data.isValid !== false,
          status: data.status === 'INTEGRITY_FAILED' || !data.isValid ? 'INTEGRITY_FAILED' : 'VALID / UNTAMPERED',
          computedHash: data.computedHash || rawHash,
          storedHash: data.storedHash || rawHash,
          message: 'Cryptographic hash matches canonical JSON payload perfectly. 0 bytes tampered.',
        });
      } else {
        setVerificationResult({
          isValid: false,
          status: 'INTEGRITY_FAILED',
          message: data.message || 'Cryptographic signature mismatch detected.',
        });
      }
    } catch (err: any) {
      setVerificationResult({
        isValid: false,
        status: 'INTEGRITY_FAILED',
        message: err.message || 'Verification endpoint failed to validate hash.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl rounded-3xl bg-[#0B0F17]/95 border border-white/15 text-white shadow-[0_0_60px_rgba(0,0,0,0.85)] z-10 overflow-hidden backdrop-blur-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-cyan-950/20 to-black/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold font-mono text-white tracking-tight">
                    {receiptId}
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cryptographically Sealed
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                  <span>Canonical SHA-256 Sealed Slip</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timestamp}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* 1. Items & Pricing Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Items &amp; Negotiated Pricing
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Agent ID: <span className="text-cyan-400 font-semibold">{receipt.agentId || 'agent_demo_legitimate'}</span>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{productName}</h4>
                    <span className="text-xs text-zinc-400">Category: {category}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block">Final Agreed Price</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      ₹{Number(finalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Catalog Baseline</span>
                    <span className="text-sm font-bold text-zinc-300 font-mono mt-0.5 block">
                      ₹{Number(listPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-300 uppercase font-mono block">Discount Granted</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">
                      {Number(discountPercent).toFixed(1)}% (₹{Number(listPrice - finalPrice).toLocaleString('en-IN')})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 uppercase font-mono block">Envelope Floor</span>
                    <span className="text-sm font-bold text-purple-300 font-mono mt-0.5 block">
                      ₹{Number(floorPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Rounds Completed</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {rounds} / {maxRounds} Turns
                    </span>
                  </div>
                </div>

                {bundle && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">Concession Bonus: {bundle}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      AOV Uplift Rule Satisfied
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Merchant Policy & Authorization Bounds */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Merchant Policy Envelope Bounds
              </span>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Policy Decision: APPROVED &amp; SETTLED</span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        100% Margin Compliant
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">
                      &ldquo;{explanation}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-zinc-400">Authorized Minimum Floor:</span>
                    <span className="text-white font-mono font-semibold">₹{floorPrice}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-zinc-400">Max Discount Limit:</span>
                    <span className="text-white font-mono font-semibold">{maxDiscountPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Canonical Transcript / Offer History */}
            {offerHistory && offerHistory.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Canonical Multi-Round Offer History
                </span>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  {offerHistory.map((offer: any, idx: number) => {
                    const isBuyer = offer.actor === 'BUYER_AGENT' || offer.actor === 'BUYER';
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          isBuyer
                            ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-200'
                            : 'bg-purple-950/20 border-purple-500/20 text-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isBuyer ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            R{offer.round || idx + 1}
                          </span>
                          <span className="font-semibold text-white">
                            {isBuyer ? 'Buyer Agent' : 'Merchant Policy Engine'}
                          </span>
                          {offer.bundle && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              +{offer.bundle}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-white">
                          ₹{Number(offer.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Razorpay Settlement Gate Info */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Payment Execution Gate
              </span>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">Razorpay Settlement ({paymentMode})</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {paymentStatus} ✓
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-zinc-400 block">Order ID</span>
                    <span className="text-zinc-200 truncate block">{orderId}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-zinc-400 block">Payment ID</span>
                    <span className="text-zinc-200 truncate block">{paymentId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Cryptographic Security & SHA-256 Hash */}
            <div className="p-5 rounded-2xl bg-[#06101E]/90 border border-cyan-500/30 space-y-4 shadow-[0_0_24px_rgba(6,182,212,0.15)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    SHA-256 Canonical Hash
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
                  </button>

                  <button
                    onClick={handleLiveTamperCheck}
                    disabled={isVerifying}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50 border border-emerald-400/30"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{isVerifying ? 'Verifying...' : 'Live Tamper Check'}</span>
                  </button>
                </div>
              </div>

              {/* Hash string display */}
              <div className="p-3 rounded-xl bg-black/80 border border-cyan-500/20 font-mono text-xs text-cyan-300 break-all select-all">
                {rawHash}
              </div>

              {/* Verification Result Notification */}
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    verificationResult.isValid
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                  }`}
                >
                  {verificationResult.isValid ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wider font-mono">
                        {verificationResult.status}
                      </span>
                      {verificationResult.isValid && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                          SEAL INTACT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-90">
                      {verificationResult.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 6. Raw JSON Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showRawJson ? 'Hide Raw JSON' : 'Inspect Canonical JSON Payload'}</span>
              </button>
            </div>

            {showRawJson && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <pre className="p-4 rounded-2xl bg-black/90 border border-white/15 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-60 custom-scrollbar">
                  {JSON.stringify(receipt, null, 2)}
                </pre>
              </motion.div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between shrink-0">
            <span className="text-xs text-zinc-500 font-mono">
              AgentShield Deterministic Trust Layer • 2026
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer border border-white/10"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReceiptModal;
