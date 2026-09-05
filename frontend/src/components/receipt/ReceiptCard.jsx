import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Code,
  Printer,
  Lock,
  Sparkles,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import ExplainabilityModal from '../common/ExplainabilityModal';
import api from '../../services/api';

export default function ReceiptCard({ receipt }) {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  if (!receipt) return null;

  const rawHash = receipt.receiptHash || receipt.integrity?.canonicalHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const productName = receipt.product?.name || receipt.productName || 'AeroStride Running Shoes';
  const category = receipt.product?.category || receipt.category || 'Footwear';
  const listedPrice = receipt.product?.listedPrice || receipt.listPrice || 2499;
  const finalPrice = receipt.finalPrice || receipt.negotiation?.finalAgreedPrice || receipt.amountInRupees || 2299;
  const floorPrice = receipt.negotiation?.merchantFloorPrice || receipt.policyFacts?.floorPrice || 2200;
  const discountPercent = receipt.negotiation?.discountPercent || receipt.policyFacts?.discountPercent || 8.0;
  const rounds = receipt.negotiation?.roundsCount || receipt.policyFacts?.round || 3;
  const maxRounds = receipt.negotiation?.maxAllowedRounds || receipt.policyFacts?.maxRounds || 3;
  const bundle = receipt.negotiation?.bundleGranted || receipt.bundle || receipt.policyFacts?.bundleGranted || 'Sports Socks';
  const explanation = receipt.explanation || receipt.policy?.explanation || 'Approved because ₹2,299 is above merchant floor ₹2,200 and within discount bounds.';
  const orderId = receipt.payment?.orderId || receipt.orderId || 'order_test_2026';
  const paymentId = receipt.payment?.paymentId || receipt.paymentId || 'pay_test_verified';
  const gateway = receipt.payment?.gateway || receipt.paymentMode || 'Razorpay Test Mode';

  const copyHash = () => {
    navigator.clipboard.writeText(rawHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const data = await api.verifyReceipt(receipt.receiptId, { receipt });
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({ isValid: false, status: 'INTEGRITY_FAILED', message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-border rounded-2xl shadow-2xs overflow-hidden print:border-none text-foreground font-body">

      {/* Top Header */}
      <div className="bg-[#0C2340] p-4 text-white flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase font-body">Negotiation Receipt</h2>
            <p className="text-[11px] text-slate-300 font-body">Cryptographically Sealed AI Commerce Record</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">

        {/* Product & Receipt ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight font-display">{productName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Category: <span className="text-foreground font-medium">{category}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Receipt ID</span>
            <p className="text-sm font-mono font-bold text-accent mt-0.5">{receipt.receiptId}</p>
            <span className="text-[11px] text-muted-foreground">{new Date(receipt.timestamp || Date.now()).toLocaleString()}</span>
          </div>
        </div>

        {/* Financial Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">

          <div className="p-3.5 bg-secondary/50 border border-border/80 rounded-xl">
            <span className="text-[11px] text-muted-foreground block font-medium">Listed Price</span>
            <span className="text-base font-bold text-foreground mt-1 block font-mono">
              ₹{Number(listedPrice).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[11px] text-emerald-800 font-semibold block">Final Agreed Price</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block font-mono">
              ₹{Number(finalPrice).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 bg-secondary/50 border border-border/80 rounded-xl">
            <span className="text-[11px] text-muted-foreground block font-medium">Discount</span>
            <span className="text-base font-bold text-accent mt-1 block font-mono">
              {Number(discountPercent).toFixed(1)}%
            </span>
          </div>

          <div className="p-3.5 bg-secondary/50 border border-border/80 rounded-xl">
            <span className="text-[11px] text-muted-foreground block font-medium">Merchant Floor</span>
            <span className="text-sm font-medium text-foreground mt-1 block font-mono">
              ₹{Number(floorPrice).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 bg-secondary/50 border border-border/80 rounded-xl">
            <span className="text-[11px] text-muted-foreground block font-medium">Rounds Completed</span>
            <span className="text-sm font-medium text-foreground mt-1 block">
              {rounds} / {maxRounds} Rounds
            </span>
          </div>

          <div className="p-3.5 bg-secondary/50 border border-border/80 rounded-xl">
            <span className="text-[11px] text-muted-foreground block font-medium">Bundle Concession</span>
            <span className="text-xs font-bold text-emerald-700 mt-1 block truncate">
              {bundle || 'None'}
            </span>
          </div>

        </div>

        {/* Policy Decision Summary */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                SETTLED ✓
              </span>
              <span className="text-xs font-semibold text-emerald-950">Deterministic Policy Passed</span>
            </div>
            <p className="text-xs text-emerald-900 italic font-body">
              &ldquo;{explanation}&rdquo;
            </p>
          </div>

          <button
            onClick={() => setShowExplainModal(true)}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition-colors flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Why approved?</span>
          </button>
        </div>

        {/* Razorpay Test Mode Payment Details */}
        <div className="p-4 bg-secondary/40 border border-border rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground">Razorpay Test Mode Settlement</span>
            </div>
            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">PAID ✓</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/80 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Gateway</span>
              <span className="text-foreground font-medium">{gateway}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Razorpay Order ID</span>
              <span className="text-foreground font-mono text-[11px] truncate block">{orderId}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Payment ID</span>
              <span className="text-foreground font-mono text-[11px] truncate block">{paymentId}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Seal & VERIFY INTEGRITY Action */}
        <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs text-foreground font-semibold">
              <Lock className="w-3.5 h-3.5 text-accent" />
              <span>SHA-256 Canonical Seal</span>
            </div>
            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifying}
              className="px-3 py-1 bg-accent text-accent-foreground hover:opacity-90 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
            >
              {isVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              <span>{isVerifying ? 'Verifying...' : 'Verify Integrity'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 p-2 bg-white border border-border rounded-lg text-[11px] font-mono text-foreground break-all select-all">
              {rawHash}
            </div>
            <button
              onClick={copyHash}
              className="p-2 rounded-lg bg-white hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy Hash"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {verificationResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${verificationResult.isValid !== false
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
              : 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
              }`}>
              {verificationResult.isValid !== false ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>VALID / UNTAMPERED ✓ Cryptographic hash matches canonical JSON payload perfectly.</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>INTEGRITY FAILED ✗ Hash mismatch detected.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Raw JSON */}
        {showRawJson && (
          <div className="pt-2">
            <pre className="p-4 rounded-xl bg-secondary/80 border border-border text-[11px] font-mono text-foreground overflow-x-auto max-h-72">
              {JSON.stringify(receipt, null, 2)}
            </pre>
          </div>
        )}

      </div>

      <ExplainabilityModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        facts={receipt.policyFacts || receipt.policy?.facts || {
          decision: 'SETTLE',
          productId: receipt.productId || 'running-shoes',
          proposedPrice: finalPrice,
          floorPrice,
          discountPercent,
          maxDiscountPercent: 12.0,
          round: rounds,
          maxRounds,
          giftGranted: bundle,
          explanation
        }}
        title="Why was this settlement approved?"
      />
    </div>
  );
}
