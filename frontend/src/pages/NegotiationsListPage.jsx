import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Play, 
  ArrowRight, 
  Bot, 
  ShoppingBag, 
  Gift, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import api from '../services/api';

export default function NegotiationsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAgent = searchParams.get('agent') || '';
  const initialProduct = searchParams.get('product') || '';

  const [products, setProducts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Negotiation Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('running-shoes');
  const [selectedAgentId, setSelectedAgentId] = useState('agent_demo_legitimate');
  const [isStarting, setIsStarting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, agentRes, rcptRes, auditRes] = await Promise.all([
        api.getProducts().catch(() => ({ success: false })),
        api.getAgents().catch(() => ({ success: false })),
        api.getReceipts().catch(() => ({ success: false })),
        api.getAuditEvents({ limit: 40 }).catch(() => ({ success: false })),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (agentRes.success) setAgents(agentRes.agents || []);
      if (rcptRes.success) setReceipts(rcptRes.receipts || []);
      if (auditRes.success) setAuditEvents(auditRes.events || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load negotiation sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartNegotiation = async (e) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      const product = products.find(p => p.id === selectedProductId) || products[0];
      const agent = agents.find(a => a.agentId === selectedAgentId) || { agentId: selectedAgentId, name: selectedAgentId };

      const res = await api.createNegotiation({
        productId: product.id,
        buyerAgentId: agent.agentId,
        buyerAgentName: agent.name,
      });

      if (res.success && res.sessionId) {
        setIsNewModalOpen(false);
        navigate(`/negotiations/${res.sessionId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create session.');
    } finally {
      setIsStarting(false);
    }
  };

  // Compile sessions list from receipts and active audit sessions
  const sessions = [];
  const seenSessions = new Set();

  // Add sessions from receipts
  for (const rcpt of receipts) {
    if (rcpt.sessionId && !seenSessions.has(rcpt.sessionId)) {
      seenSessions.add(rcpt.sessionId);
      sessions.push({
        sessionId: rcpt.sessionId,
        agentId: rcpt.agentId || 'agent_demo_legitimate',
        agentName: 'Agent A (Smart Shopper AI)',
        productId: rcpt.product?.id || 'running-shoes',
        productName: rcpt.product?.name || 'Running Shoes',
        listPrice: rcpt.listPrice || 2499,
        finalPrice: rcpt.finalPrice || 2299,
        currentOffer: rcpt.finalPrice || 2299,
        discountPercent: rcpt.discountPercent || 8.0,
        rounds: rcpt.negotiationRounds || rcpt.roundsCount || 3,
        maxRounds: 3,
        bundle: rcpt.bundle || 'Sports Socks',
        status: 'SETTLED',
        receiptId: rcpt.receiptId,
        timestamp: rcpt.timestamp || new Date().toISOString(),
      });
    }
  }

  // Add demo sessions from audit trail
  const sessionAuditMap = new Map();
  for (const evt of auditEvents) {
    if (evt.sessionId && !sessionAuditMap.has(evt.sessionId)) {
      sessionAuditMap.set(evt.sessionId, evt);
    }
  }

  for (const [sId, evt] of sessionAuditMap.entries()) {
    if (!seenSessions.has(sId)) {
      seenSessions.add(sId);
      const isBlocked = evt.status === 'BLOCKED' || evt.decision === 'BLOCK' || evt.action === 'ATTACK_DETECTED';
      const isSettled = evt.action === 'SETTLEMENT' || evt.action === 'RECEIPT_CREATED';

      sessions.push({
        sessionId: sId,
        agentId: evt.agentId || 'agent_demo_adversarial',
        agentName: evt.agentId === 'agent_demo_adversarial' ? 'Agent B (Adversarial Prober)' : 'Autonomous Buyer AI',
        productId: 'running-shoes',
        productName: 'Running Shoes',
        listPrice: 2499,
        finalPrice: isSettled ? 2299 : null,
        currentOffer: isBlocked ? 1 : 2299,
        discountPercent: isBlocked ? 99.9 : 8.0,
        rounds: isBlocked ? 1 : 3,
        maxRounds: 3,
        bundle: isBlocked ? null : 'Sports Socks',
        status: isBlocked ? 'BLOCKED' : isSettled ? 'SETTLED' : 'ACTIVE',
        receiptId: isSettled ? 'NGR-2026-0001' : null,
        timestamp: evt.timestamp || new Date().toISOString(),
      });
    }
  }

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Negotiation Management
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              {sessions.length} Sessions Logged
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time multi-turn negotiation sessions bounded by merchant price floors, discount caps, and bundle rules.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Negotiation Arena</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions by ID, product, or buyer agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center space-x-1 bg-secondary/70 p-1 rounded-full border border-border self-start md:self-center">
          {['ALL', 'SETTLED', 'ACTIVE', 'BLOCKED'].map((st) => (
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

      {/* Negotiations Table */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading negotiation sessions &amp; envelopes..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No negotiation sessions found"
            description="Start a new live negotiation arena to watch autonomous agents negotiate within merchant bounds."
            action={
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold shadow-xs"
              >
                Launch New Negotiation
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Buyer Agent</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Listed Price</th>
                  <th className="py-3 px-4">Final / Agreed</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Rounds</th>
                  <th className="py-3 px-4">Bundle</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-accent">
                      <Link to={`/negotiations/${s.sessionId}`} className="hover:underline">
                        {s.sessionId}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center space-x-1.5">
                        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{s.agentName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {s.productName}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      ₹{Number(s.listPrice).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {s.finalPrice ? `₹${Number(s.finalPrice).toLocaleString('en-IN')}` : '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-accent">
                      {s.discountPercent ? `${Number(s.discountPercent).toFixed(1)}%` : '0%'}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {s.rounds} / {s.maxRounds}
                    </td>

                    <td className="py-3.5 px-4">
                      {s.bundle ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Gift className="w-3 h-3 text-emerald-600" />
                          <span>{s.bundle}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/negotiations/${s.sessionId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-[11px] font-medium transition-all shadow-xs"
                      >
                        <span>Open Arena</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Negotiation Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Launch Autonomous Negotiation Arena"
      >
        <form onSubmit={handleStartNegotiation} className="space-y-4 text-xs font-body">
          <div>
            <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Select Target Product Catalog Item *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — Listed: ₹{p.price || p.listPrice || 2499} (Floor: ₹{p.negotiation?.floorPrice || p.floorPrice || 2200})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Select AI Buyer Agent Entity *
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="agent_demo_legitimate">Agent A (Legitimate Smart Shopper AI)</option>
              <option value="agent_demo_adversarial">Agent B (Adversarial Prober &mdash; Prompt Injection)</option>
            </select>
          </div>

          <div className="p-3 bg-secondary/40 border border-border rounded-xl text-muted-foreground text-[11px] leading-relaxed">
            The merchant policy engine will calculate bounded counteroffers, concession curves, and bundle rules in real-time.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-secondary border border-border rounded-full text-xs text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isStarting}
              className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium shadow-xs disabled:opacity-50"
            >
              {isStarting ? 'Initiating...' : 'Start Negotiation Session'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
