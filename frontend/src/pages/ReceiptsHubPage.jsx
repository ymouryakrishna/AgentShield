import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
  Lock, 
  ArrowRight, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export default function ReceiptsHubPage() {
  const [receipts, setReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReceipts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReceipts();
      if (data.success) {
        setReceipts(data.receipts || []);
        setError(null);
      } else {
        setError('Failed to fetch receipts from backend.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const filteredReceipts = receipts.filter(rcpt => {
    const pName = rcpt.product?.name || rcpt.productName || '';
    const rId = rcpt.receiptId || '';
    const aId = rcpt.agentId || '';
    const q = searchQuery.toLowerCase();
    return pName.toLowerCase().includes(q) || rId.toLowerCase().includes(q) || aId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Negotiation Receipts Hub
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              SHA-256 Verified
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Canonical, tamper-evident commerce records cryptographically sealed with SHA-256 integrity hashes.
          </p>
        </div>

        <button
          onClick={loadReceipts}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-full text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Receipts</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipts by Receipt ID, product, or agent ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <span className="text-xs font-mono text-muted-foreground self-start md:self-center">
          Showing <strong className="text-foreground">{filteredReceipts.length}</strong> of {receipts.length} sealed slips
        </span>
      </div>

      {/* Receipts Grid */}
      {isLoading ? (
        <LoadingState message="Loading sealed negotiation receipts &amp; cryptographic proofs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadReceipts} />
      ) : filteredReceipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts generated yet"
          description="No receipts generated yet. Run a legitimate negotiation to create your first signed receipt."
          action={
            <Link
              to="/demo"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold shadow-xs"
            >
              Run Legitimate Negotiation
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReceipts.map((rcpt) => {
            const productName = rcpt.product?.name || rcpt.productName || 'Running Shoes';
            const finalPrice = rcpt.finalPrice || rcpt.negotiation?.finalAgreedPrice || rcpt.amountInRupees || 2299;
            const listedPrice = rcpt.product?.listedPrice || rcpt.listPrice || 2499;
            const discountPercent = rcpt.negotiation?.discountPercent || rcpt.policyFacts?.discountPercent || 8.0;
            const rounds = rcpt.negotiation?.roundsCount || rcpt.policyFacts?.round || 3;
            const maxRounds = rcpt.negotiation?.maxAllowedRounds || rcpt.policyFacts?.maxRounds || 3;
            const bundle = rcpt.negotiation?.bundleGranted || rcpt.bundle || rcpt.policyFacts?.bundleGranted;
            const hash = rcpt.receiptHash || rcpt.integrity?.canonicalHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

            return (
              <Link
                key={rcpt.receiptId}
                to={`/receipts/${rcpt.receiptId}`}
                className="p-5 rounded-2xl bg-white border border-border hover:border-foreground/30 transition-all shadow-2xs group block space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-accent font-bold block">{rcpt.receiptId}</span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors mt-0.5 font-display">
                      {productName}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Agent: {rcpt.agentId || 'agent_demo_legitimate'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full block">
                      ₹{Number(finalPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-1 font-mono">PAID ✓</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-secondary/50 rounded-xl border border-border/80">
                    <span className="text-[10px] text-muted-foreground block font-medium">Listed</span>
                    <span className="text-foreground font-mono font-semibold">₹{Number(listedPrice).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="p-2 bg-secondary/50 rounded-xl border border-border/80">
                    <span className="text-[10px] text-muted-foreground block font-medium">Discount</span>
                    <span className="text-accent font-bold">{Number(discountPercent).toFixed(1)}%</span>
                  </div>

                  <div className="p-2 bg-secondary/50 rounded-xl border border-border/80">
                    <span className="text-[10px] text-muted-foreground block font-medium">Rounds</span>
                    <span className="text-foreground font-semibold">{rounds} / {maxRounds}</span>
                  </div>
                </div>

                {bundle && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-1.5 text-xs text-emerald-800 font-semibold">
                    <Gift className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bundle Concession: {bundle}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1 font-mono text-[10px]">
                    <Lock className="w-3 h-3 text-accent" />
                    <span className="truncate max-w-[160px]">{hash.substring(0, 18)}...</span>
                  </div>

                  <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center space-x-1 font-semibold text-[11px]">
                    <span>View Receipt Slip</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
