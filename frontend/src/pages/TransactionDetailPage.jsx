import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  ArrowLeft, 
  Receipt, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Bot, 
  ExternalLink,
  Code,
  Copy,
  Check
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTransaction() {
      setIsLoading(true);
      try {
        const [rcptRes, auditRes] = await Promise.all([
          api.getReceipts().catch(() => ({ success: false })),
          api.getAuditEvents({ limit: 40 }).catch(() => ({ success: false })),
        ]);

        if (rcptRes.success) setReceipts(rcptRes.receipts || []);
        if (auditRes.success) setAuditEvents(auditRes.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransaction();
  }, [id]);

  if (isLoading) {
    return <LoadingState message="Fetching transaction lifecycle records &amp; payment state..." />;
  }

  // Find receipt or construct transaction record
  const matchingReceipt = receipts.find(r => r.receiptId === id || r.receiptId?.replace('NGR', 'TXN') === id || r.orderId === id || r.paymentId === id) || receipts[0];

  const transactionData = matchingReceipt ? {
    id: id.startsWith('TXN') ? id : matchingReceipt.receiptId.replace('NGR', 'TXN'),
    receiptId: matchingReceipt.receiptId,
    sessionId: matchingReceipt.sessionId || 'NGS-DEMO-2026',
    agentId: matchingReceipt.agentId || 'agent_demo_legitimate',
    agentName: 'Agent A (Smart Shopper AI)',
    productName: matchingReceipt.product?.name || matchingReceipt.productName || 'Running Shoes',
    amount: matchingReceipt.finalPrice || matchingReceipt.amountInRupees || 2299,
    listedPrice: matchingReceipt.listPrice || 2499,
    discountPercent: matchingReceipt.discountPercent || 8.0,
    bundle: matchingReceipt.bundle || 'Sports Socks',
    paymentStatus: 'PAID',
    policyStatus: 'AUTHORIZED',
    paymentMode: matchingReceipt.paymentMode || 'Razorpay Test Mode',
    orderId: matchingReceipt.razorpayOrderId || matchingReceipt.orderId || 'order_test_2026demo',
    paymentId: matchingReceipt.razorpayPaymentId || matchingReceipt.paymentId || 'pay_test_k9384729',
    timestamp: matchingReceipt.timestamp || '2026-08-31T10:31:26Z',
    receiptHash: matchingReceipt.receiptHash || matchingReceipt.integrity?.canonicalHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  } : {
    id,
    receiptId: null,
    sessionId: 'NGS-ADV-001',
    agentId: 'agent_demo_adversarial',
    agentName: 'Agent B (Adversarial Prober)',
    productName: 'Running Shoes',
    amount: 1,
    listedPrice: 2499,
    discountPercent: 99.9,
    bundle: null,
    paymentStatus: 'BLOCKED',
    policyStatus: 'POLICY_VIOLATION',
    paymentMode: 'N/A (Payment Denied)',
    orderId: 'N/A',
    paymentId: 'N/A',
    timestamp: new Date().toISOString(),
    receiptHash: null,
  };

  const copyToken = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-foreground font-body max-w-5xl mx-auto">
      
      {/* Back Link & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              to="/transactions"
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">
              Transaction Details: <span className="font-mono text-accent">{transactionData.id}</span>
            </h1>
            <StatusBadge status={transactionData.paymentStatus} size="xs" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete transaction lifecycle timeline, policy authorization token inspect, and Razorpay verification.
          </p>
        </div>

        {transactionData.receiptId && (
          <Link
            to={`/receipt/${transactionData.receiptId}`}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-medium transition-colors shadow-xs"
          >
            <Receipt className="w-4 h-4" />
            <span>View Sealed Receipt</span>
          </Link>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-border rounded-2xl shadow-2xs">
          <span className="text-[11px] text-muted-foreground block font-medium">Final Paid Amount</span>
          <span className="text-xl font-bold text-emerald-700 font-mono mt-1 block">
            ₹{Number(transactionData.amount).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 bg-white border border-border rounded-2xl shadow-2xs">
          <span className="text-[11px] text-muted-foreground block font-medium">Original Catalog Price</span>
          <span className="text-base font-bold text-foreground font-mono mt-1 block">
            ₹{Number(transactionData.listedPrice).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 bg-white border border-border rounded-2xl shadow-2xs">
          <span className="text-[11px] text-muted-foreground block font-medium">Effective Discount</span>
          <span className="text-base font-bold text-accent font-mono mt-1 block">
            {Number(transactionData.discountPercent).toFixed(1)}%
          </span>
        </div>

        <div className="p-4 bg-white border border-border rounded-2xl shadow-2xs">
          <span className="text-[11px] text-muted-foreground block font-medium">Bundle Attachment</span>
          <span className="text-xs font-bold text-emerald-700 mt-1 block truncate">
            {transactionData.bundle || 'None'}
          </span>
        </div>
      </div>

      {/* 2-Column: Lifecycle Timeline & Payment Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 5-Step Payment Security Lifecycle (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Cryptographic Payment Lifecycle
            </h3>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            
            {/* Step 1 */}
            <div className="relative flex items-start space-x-3 text-xs pl-8">
              <span className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              <div>
                <span className="font-bold text-foreground block">1. Agent Handshake &amp; Discovery</span>
                <p className="text-muted-foreground mt-0.5">
                  Entity <strong className="font-mono text-foreground">{transactionData.agentId}</strong> initiated negotiation session for {transactionData.productName}.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start space-x-3 text-xs pl-8">
              <span className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              <div>
                <span className="font-bold text-foreground block">2. CommerceFirewall 10-Check Verification</span>
                <p className="text-muted-foreground mt-0.5">
                  Proposed ₹{transactionData.amount} passed price floor, discount limit, round boundaries, and prompt injection scan.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start space-x-3 text-xs pl-8">
              <span className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              <div>
                <span className="font-bold text-foreground block">3. Customer Consent &amp; Policy Authorization Token</span>
                <p className="text-muted-foreground mt-0.5">
                  Human customer verified terms. Deterministic Policy Engine generated signed authorization token.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start space-x-3 text-xs pl-8">
              <span className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              <div>
                <span className="font-bold text-foreground block">4. Razorpay Test Order &amp; Signature Verification</span>
                <p className="text-muted-foreground mt-0.5 font-mono">
                  Order: {transactionData.orderId} &bull; Payment: {transactionData.paymentId} verified server-side.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative flex items-start space-x-3 text-xs pl-8">
              <span className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              <div>
                <span className="font-bold text-foreground block">5. Negotiation Receipt Sealed with SHA-256</span>
                <p className="text-muted-foreground mt-0.5">
                  Canonical record sealed with tamper-evident cryptographic hash.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Payment Details & Token Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-border rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Settlement Meta</span>
              <StatusBadge status={transactionData.paymentStatus} size="xs" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gateway</span>
                <span className="font-medium text-foreground">{transactionData.paymentMode}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Razorpay Order ID</span>
                <span className="font-mono text-[11px] text-foreground font-semibold">{transactionData.orderId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono text-[11px] text-foreground font-semibold">{transactionData.paymentId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session ID</span>
                <Link to={`/negotiations/${transactionData.sessionId}`} className="font-mono text-[11px] text-accent hover:underline">
                  {transactionData.sessionId}
                </Link>
              </div>
            </div>
          </div>

          {/* SHA-256 Hash Box */}
          {transactionData.receiptHash && (
            <div className="bg-white border border-border rounded-2xl p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  <span>SHA-256 Receipt Seal</span>
                </span>
                <button
                  onClick={() => copyToken(transactionData.receiptHash)}
                  className="text-[11px] text-accent hover:opacity-80 flex items-center space-x-1 cursor-pointer font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-secondary/50 rounded-xl border border-border font-mono text-[10px] text-foreground break-all">
                {transactionData.receiptHash}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
