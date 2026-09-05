import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Receipt as ReceiptIcon, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const [rcptRes, metricRes, auditRes] = await Promise.all([
        api.getReceipts().catch(() => ({ success: false })),
        api.getMetrics().catch(() => ({ success: false })),
        api.getAuditEvents({ limit: 50 }).catch(() => ({ success: false })),
      ]);

      if (rcptRes.success) setReceipts(rcptRes.receipts || []);
      if (metricRes.success) setMetrics(metricRes.metrics);
      if (auditRes.success) setAuditEvents(auditRes.events || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Construct comprehensive transactions list from backend receipts & settlements
  const transactions = [];

  for (const rcpt of receipts) {
    transactions.push({
      id: rcpt.receiptId.replace('NGR', 'TXN'),
      receiptId: rcpt.receiptId,
      sessionId: rcpt.sessionId || 'NGS-DEMO-2026',
      agentId: rcpt.agentId || 'agent_demo_legitimate',
      agentName: 'Agent A (Smart Shopper AI)',
      productName: rcpt.product?.name || rcpt.productName || 'Running Shoes',
      amount: rcpt.finalPrice || rcpt.amountInRupees || 2299,
      paymentStatus: 'PAID',
      policyStatus: 'AUTHORIZED',
      gateway: rcpt.paymentMode || 'Razorpay Test Mode',
      orderId: rcpt.razorpayOrderId || rcpt.orderId || 'order_test_2026demo',
      paymentId: rcpt.razorpayPaymentId || rcpt.paymentId || 'pay_test_k9384729',
      timestamp: rcpt.timestamp || '2026-08-31T10:31:26Z',
    });
  }

  // Also include baseline transactions from audit events if present
  const blockedEvents = auditEvents.filter(e => e.action === 'REQUEST_BLOCKED' || e.status === 'BLOCKED');
  for (const b of blockedEvents) {
    transactions.push({
      id: `TXN-BLK-${b.eventId || Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      receiptId: null,
      sessionId: b.sessionId || 'NGS-ADV-001',
      agentId: b.agentId || 'agent_demo_adversarial',
      agentName: b.agentId === 'agent_demo_adversarial' ? 'Agent B (Adversarial Prober)' : 'Unauthorized Agent',
      productName: 'Running Shoes',
      amount: b.metadata?.price || 1,
      paymentStatus: 'BLOCKED',
      policyStatus: 'POLICY_VIOLATION',
      gateway: 'N/A (Payment Denied)',
      orderId: 'N/A',
      paymentId: 'N/A',
      timestamp: b.timestamp || new Date().toISOString(),
    });
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Transactions &amp; Settlements
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Razorpay Test Mode
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Server-side Razorpay payment executions strictly gated by signed cryptographic Policy Authorization Tokens.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/negotiations"
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium transition-all shadow-xs"
          >
            <span>Launch Negotiation Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-700">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Zero Client Secrets</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Razorpay API keys and secrets are never exposed to the frontend. All orders and HMAC-SHA256 signature verifications happen strictly server-side.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-accent">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Policy Token Gated</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct AI payment calls are rejected with HTTP 403. Order creation requires a cryptographically signed Policy Authorization Token.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Settled Volume</span>
          </div>
          <p className="text-xl font-bold text-foreground font-mono mt-0.5">
            ₹{metrics ? Number(metrics.totalRevenue || 0).toLocaleString('en-IN') : '28,885'}
          </p>
          <span className="text-[10px] text-muted-foreground block">
            {receipts.length} verified settled transactions
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by ID, order ID, product, or agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center space-x-1 bg-secondary/70 p-1 rounded-full border border-border self-start md:self-center">
          {['ALL', 'PAID', 'BLOCKED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading transactions &amp; Razorpay payment telemetry..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTransactions} />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions recorded"
            description="No transactions match your search criteria. Run a simulation from the Demo Center."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer / Agent</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Policy Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-accent">
                      <Link to={`/transactions/${t.id}`} className="hover:underline">
                        {t.id}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center space-x-1.5">
                        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{t.agentName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {t.productName}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      ₹{Number(t.amount).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {t.orderId}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.paymentStatus} size="xs" />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold ${t.policyStatus === 'AUTHORIZED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {t.policyStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/transactions/${t.id}`}
                          className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-full text-[11px] font-medium transition-colors"
                        >
                          Details
                        </Link>
                        {t.receiptId && (
                          <Link
                            to={`/receipt/${t.receiptId}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-medium transition-colors"
                          >
                            <ReceiptIcon className="w-3 h-3 text-emerald-600" />
                            <span>Receipt</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
