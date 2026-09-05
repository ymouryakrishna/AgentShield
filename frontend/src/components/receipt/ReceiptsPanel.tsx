import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Search,
  RefreshCw,
  Play,
  Lock,
  ArrowRight,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface ReceiptsPanelProps {
  receipts: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectReceipt: (receipt: any) => void;
  onRunLegitimateDemo?: () => void;
  isLegitimateRunning?: boolean;
}

export const ReceiptsPanel: React.FC<ReceiptsPanelProps> = ({
  receipts,
  isLoading,
  onRefresh,
  onSelectReceipt,
  onRunLegitimateDemo,
  isLegitimateRunning = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReceipts = (Array.isArray(receipts) ? receipts : []).filter((rcpt) => {
    if (!rcpt) return false;
    const pName = rcpt.product?.name || rcpt.productName || '';
    const rId = rcpt.receiptId || '';
    const aId = rcpt.agentId || '';
    const hash = rcpt.receiptHash || rcpt.integrity?.canonicalHash || '';
    const q = searchQuery.toLowerCase();
    return (
      pName.toLowerCase().includes(q) ||
      rId.toLowerCase().includes(q) ||
      aId.toLowerCase().includes(q) ||
      hash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-white font-sans">
      
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F17]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>SHA-256 Cryptographic Receipts</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  SEALED &amp; TAMPER-EVIDENT
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Canonical, immutable commerce settlement slips hashed and signed post-payment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onRunLegitimateDemo && (
            <button
              onClick={onRunLegitimateDemo}
              disabled={isLegitimateRunning || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50 border border-emerald-400/30"
            >
              {isLegitimateRunning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Run Negotiation Simulation</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-[#0B0F17]/85 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipts by ID (e.g. NGR-2026), product, agent, or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 self-start sm:self-center px-2">
          <span>
            Showing <strong className="text-white">{filteredReceipts.length}</strong> of {receipts.length} slips
          </span>
        </div>
      </div>

      {/* 3. Receipts Display (Loading Skeletons, Empty State, or Grid) */}
      {isLoading ? (
        /* Graceful Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-[#0B0F17]/85 border border-white/10 space-y-4 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="w-28 h-4 bg-white/10 rounded-md" />
                  <div className="w-44 h-6 bg-white/10 rounded-md" />
                  <div className="w-32 h-3 bg-white/5 rounded-md" />
                </div>
                <div className="w-20 h-8 bg-emerald-500/10 rounded-full" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="h-12 bg-white/5 rounded-xl" />
              </div>

              <div className="h-4 bg-white/5 rounded-md w-3/4" />
            </div>
          ))}
        </div>
      ) : receipts.length === 0 ? (
        /* Clean Empty State */
        <div className="p-12 text-center rounded-3xl bg-[#0B0F17]/85 backdrop-blur-xl border border-white/10 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            <Receipt className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              No receipts generated yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              No receipts generated yet. Run a legitimate negotiation to create your first signed receipt.
            </p>
          </div>

          {onRunLegitimateDemo && (
            <button
              onClick={onRunLegitimateDemo}
              disabled={isLegitimateRunning}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all cursor-pointer hover:scale-105 active:scale-95 border border-emerald-400/40"
            >
              {isLegitimateRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>Run Legitimate Negotiation</span>
            </button>
          )}
        </div>
      ) : filteredReceipts.length === 0 ? (
        /* Filter No Match State */
        <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-400 font-mono">
          No receipts matching &ldquo;{searchQuery}&rdquo;. Try another search term.
        </div>
      ) : (
        /* Receipts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReceipts.map((rcpt) => {
            const productName = rcpt.product?.name || rcpt.productName || 'Running Shoes';
            const finalPrice =
              rcpt.finalPrice || rcpt.negotiation?.finalAgreedPrice || rcpt.amountInRupees || 2299;
            const listedPrice = rcpt.listPrice || rcpt.product?.listPrice || rcpt.product?.listedPrice || 2499;
            const discountPercent =
              rcpt.discountPercent !== undefined
                ? rcpt.discountPercent
                : rcpt.negotiation?.discountPercent ||
                  (listedPrice > 0 ? ((listedPrice - finalPrice) / listedPrice) * 100 : 8.0);
            const rounds = rcpt.negotiationRounds || rcpt.negotiation?.roundsCount || rcpt.policyFacts?.round || 2;
            const bundle = rcpt.bundle || rcpt.negotiation?.bundleGranted || rcpt.policyFacts?.bundleGranted;
            const hash =
              rcpt.receiptHash ||
              rcpt.integrity?.canonicalHash ||
              'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
            const timestamp = rcpt.timestamp ? new Date(rcpt.timestamp).toLocaleTimeString() : 'Just now';

            return (
              <motion.div
                key={rcpt.receiptId || Math.random()}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectReceipt(rcpt)}
                className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 hover:border-emerald-500/40 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.3)] group cursor-pointer space-y-4 relative overflow-hidden backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {rcpt.receiptId}
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                        SHA-256 Sealed
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mt-1 tracking-tight">
                      {productName}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      Agent: {rcpt.agentId || 'agent_demo_legitimate'}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl block shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      ₹{Number(finalPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-1 font-mono flex items-center justify-end gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timestamp}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-mono">Listed</span>
                    <span className="text-zinc-200 font-mono font-semibold">
                      ₹{Number(listedPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-cyan-950/20 rounded-xl border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-300 block font-mono">Discount</span>
                    <span className="text-cyan-400 font-bold font-mono">
                      {Number(discountPercent).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-purple-950/20 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block font-mono">Rounds</span>
                    <span className="text-purple-300 font-semibold">{rounds} Turns</span>
                  </div>
                </div>

                {bundle && (
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold">Concession: {bundle}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">AOV Bundle ✓</span>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 truncate max-w-[200px]">
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{hash.substring(0, 20)}...</span>
                  </div>

                  <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold text-xs shrink-0">
                    <span>Inspect Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ReceiptsPanel;
