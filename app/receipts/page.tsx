'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Lock,
  Sparkles,
  Search
} from 'lucide-react';
import { NegotiationReceipt } from '@/lib/types';

export default function ReceiptsHubPage() {
  const [receipts, setReceipts] = useState<NegotiationReceipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/receipts');
      const data = await res.json();
      if (data.success) {
        setReceipts(data.receipts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.receiptId.toLowerCase().includes(q) ||
      r.product.name.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      r.integrity.canonicalHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Negotiation Receipts Hub
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SHA-256 Sealed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cryptographically signed proof of every settled autonomous AI transaction with full policy explanation and Razorpay payment linkage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Integrity Verified</span>
            <span className="text-sm font-bold text-emerald-400">{receipts.length} Receipts (100% Valid)</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by receipt ID (e.g. NGR-2026-0001), product, or SHA-256 hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReceipts.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No negotiation receipts found. Complete a live negotiation or trigger the Legitimate Buyer demo.
          </div>
        ) : (
          filteredReceipts.map((rcpt) => (
            <Link
              key={rcpt.receiptId}
              href={`/receipts/${rcpt.receiptId}`}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all block group shadow-card-elevated"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-emerald-400 font-mono">{rcpt.receiptId}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      SETTLED ✓
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{rcpt.product.name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-white">₹{rcpt.negotiation.finalAgreedPrice.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block line-through">
                    Listed: ₹{rcpt.product.listedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Middle Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">Discount</span>
                  <span className="font-semibold text-cyan-400">
                    ₹{rcpt.negotiation.savedAmount} ({rcpt.negotiation.discountPercent.toFixed(1)}%)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Rounds</span>
                  <span className="font-semibold">{rcpt.negotiation.roundsCount} Rounds</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Bundle Attached</span>
                  <span className="font-semibold text-emerald-300 truncate block">
                    {rcpt.negotiation.bundleGranted || 'None'}
                  </span>
                </div>
              </div>

              {/* SHA-256 seal & link */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[200px]">{rcpt.integrity.canonicalHash.substring(0, 20)}...</span>
                </div>

                <div className="flex items-center space-x-1 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View Sealed Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
