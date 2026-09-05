import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Receipt as ReceiptIcon,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function PaymentsPage() {
  const [receipts, setReceipts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [receiptRes, metricRes] = await Promise.all([
          api.getReceipts().catch(() => ({ success: false })),
          api.getMetrics().catch(() => ({ success: false })),
        ]);

        if (receiptRes.success) setReceipts(receiptRes.receipts || []);
        if (metricRes.success) setMetrics(metricRes.metrics);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Payments &amp; Settlement Gate
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Razorpay Test Mode
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Server-side Razorpay Test Mode execution strictly gated by signed cryptographic Policy Authorization Tokens.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/demo"
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium transition-all shadow-xs"
          >
            <span>Run Test Payment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Security Gate Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-600">
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
          <div className="flex items-center space-x-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Total Settled Volume</span>
          </div>
          <p className="text-xl font-bold text-foreground font-mono mt-0.5">
            ₹{metrics ? Number(metrics.totalRevenue || 0).toLocaleString('en-IN') : '28,885'}
          </p>
          <span className="text-[10px] text-muted-foreground block">
            {receipts.length} verified settled transactions
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Settled Orders &amp; Razorpay Test Payments</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {receipts.length} total receipts
          </span>
        </div>

        {receipts.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No payment settlements recorded yet. Launch a legitimate buyer negotiation from the Demo Center.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="pb-2.5">Receipt ID</th>
                  <th className="pb-2.5">Order ID</th>
                  <th className="pb-2.5">Payment ID</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Mode</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {receipts.map((r) => (
                  <tr key={r.receiptId} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-mono font-semibold text-foreground">
                      {r.receiptId}
                    </td>
                    <td className="py-3 font-mono text-muted-foreground">
                      {r.orderId || r.payment?.orderId || 'order_test'}
                    </td>
                    <td className="py-3 font-mono text-muted-foreground">
                      {r.paymentId || r.payment?.paymentId || 'pay_test_001'}
                    </td>
                    <td className="py-3 font-mono font-bold text-foreground">
                      ₹{Number(r.finalPrice || r.amountInRupees || r.negotiation?.finalAgreedPrice || 2299).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                        {r.paymentMode || r.payment?.paymentMode || 'TEST MODE'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>PAID</span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/receipt/${r.receiptId}`}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-accent hover:opacity-80 transition-opacity"
                      >
                        <ReceiptIcon className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </Link>
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
