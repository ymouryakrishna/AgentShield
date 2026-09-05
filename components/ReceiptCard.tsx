'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText, 
  Code, 
  Download, 
  Printer, 
  ExternalLink,
  QrCode,
  Sparkles,
  Lock,
  ArrowDown
} from 'lucide-react';
import { NegotiationReceipt } from '@/lib/types';
import ExplainabilityModal from './ExplainabilityModal';

interface ReceiptCardProps {
  receipt: NegotiationReceipt;
  onVerify?: () => void;
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(receipt.integrity.canonicalHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden print:bg-white print:text-slate-950 print:border-none">
      
      {/* Top Receipt Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 text-slate-950 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950/20 backdrop-blur-sm flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider uppercase">Negotiation Receipt</h2>
            <p className="text-[11px] font-semibold opacity-90">Cryptographically Sealed AI Commerce Record</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-md bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition-colors"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-950/20 hover:bg-slate-950/30 text-xs font-semibold transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Receipt Body */}
      <div className="p-6 sm:p-8 space-y-6">

        {/* Receipt Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{receipt.product.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Category: <span className="text-slate-300 font-medium">{receipt.product.category}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Receipt ID</span>
            <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{receipt.receiptId}</p>
            <span className="text-[11px] text-slate-500">{new Date(receipt.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Financial & Negotiation Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Listed Price</span>
            <span className="text-base font-bold text-slate-300 mt-1 block">
              ₹{receipt.product.listedPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <span className="text-[11px] text-emerald-300 font-semibold block">Final Agreed Price</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">
              ₹{receipt.negotiation.finalAgreedPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Savings / Discount</span>
            <span className="text-base font-bold text-cyan-400 mt-1 block">
              ₹{receipt.negotiation.savedAmount.toLocaleString('en-IN')} ({receipt.negotiation.discountPercent.toFixed(1)}%)
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Merchant Floor</span>
            <span className="text-sm font-medium text-slate-200 mt-1 block">
              ₹{receipt.negotiation.merchantFloorPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Rounds Completed</span>
            <span className="text-sm font-medium text-slate-200 mt-1 block">
              {receipt.negotiation.roundsCount} / {receipt.negotiation.maxAllowedRounds} Rounds
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Complimentary Bundle</span>
            <span className="text-xs font-bold text-emerald-300 mt-1 block truncate">
              {receipt.negotiation.bundleGranted || 'None'}
            </span>
          </div>

        </div>

        {/* Negotiation History Log in Receipt */}
        {receipt.negotiation.history && receipt.negotiation.history.length > 0 && (
          <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Negotiation Trail
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              {receipt.negotiation.history.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">
                    Round {step.round} — {step.actor === 'BUYER_AGENT' ? 'AI Buyer' : 'Merchant AI'}:
                  </span>
                  <span className="font-semibold text-white">
                    ₹{step.price.toLocaleString('en-IN')} {step.bundle ? `+ ${step.bundle}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Engine Decision Summary */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SETTLED ✓
              </span>
              <span className="text-xs font-semibold text-white">Policy Engine Status: PASSED</span>
            </div>
            <p className="text-xs text-slate-300 italic">
              &quot;{receipt.policy.explanation}&quot;
            </p>
          </div>

          <button
            onClick={() => setShowExplainModal(true)}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why was this approved?</span>
          </button>
        </div>

        {/* Razorpay Test Mode Payment Details */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Payment Method</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">PAID ✓</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Gateway</span>
              <span className="text-slate-300 font-medium">{receipt.payment.gateway}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Razorpay Order ID</span>
              <span className="text-slate-300 font-mono text-[11px] truncate block">{receipt.payment.orderId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Payment ID</span>
              <span className="text-slate-300 font-mono text-[11px] truncate block">{receipt.payment.paymentId}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Tamper-Evident SHA-256 Integrity Seal */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Receipt Integrity: VERIFIED ✓</span>
            </div>
            <span className="text-[10px] uppercase font-mono text-slate-400">SHA-256 CANONICAL HASH</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 break-all select-all">
              {receipt.integrity.canonicalHash}
            </div>
            <button
              onClick={copyHash}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Hash"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Raw JSON Accordion */}
        {showRawJson && (
          <div className="pt-2">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72">
              {JSON.stringify(receipt, null, 2)}
            </pre>
          </div>
        )}

      </div>

      {/* Explainability Modal Attached */}
      <ExplainabilityModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        facts={receipt.policy.facts}
        title="Why was this settlement approved?"
      />
    </div>
  );
}
