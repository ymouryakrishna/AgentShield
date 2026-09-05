import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  ExternalLink,
  MessageSquare,
  Play,
  Sparkles,
  Sliders,
  Send,
  Loader2
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Drawer from '../components/common/Drawer';
import Modal from '../components/common/Modal';
import api from '../services/api';

export default function AIAgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Agent Drawer & Register Modal State
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    agentId: '',
    name: '',
    type: 'LEGITIMATE',
    whitelisted: true,
  });
  const [isRegistering, setIsRegistering] = useState(false);

  // Chat Simulator State
  const [simulatorMessages, setSimulatorMessages] = useState([
    {
      id: 1,
      sender: 'AGENT',
      text: 'Hello! I am an autonomous AI buyer agent. Tell me what product you are looking for, and I will search the merchant catalog and negotiate a margin-bounded price.',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  const fetchAgentsData = async () => {
    setIsLoading(true);
    try {
      const [agentsRes, auditRes] = await Promise.all([
        api.getAgents().catch(() => ({ success: false })),
        api.getAuditEvents({ limit: 50 }).catch(() => ({ success: false })),
      ]);

      if (agentsRes.success) {
        setAgents(agentsRes.agents || []);
        setError(null);
      } else {
        setError('Failed to fetch agents registry from backend.');
      }

      if (auditRes.success) {
        setAuditEvents(auditRes.events || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsData();
  }, []);

  const handleRegisterAgent = async (e) => {
    e.preventDefault();
    if (!registerForm.agentId.trim()) return;

    setIsRegistering(true);
    try {
      const res = await api.registerAgent(registerForm);
      if (res.success) {
        setIsRegisterModalOpen(false);
        setRegisterForm({ agentId: '', name: '', type: 'LEGITIMATE', whitelisted: true });
        fetchAgentsData();
      }
    } catch (err) {
      alert(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSendChatMessage = (text) => {
    const query = text || chatInput;
    if (!query.trim() || isChatProcessing) return;

    setSimulatorMessages(prev => [...prev, { id: Date.now(), sender: 'USER', text: query }]);
    setChatInput('');
    setIsChatProcessing(true);

    setTimeout(() => {
      let product = { name: 'AeroStride Pro Running Shoes', listPrice: 2499, floorPrice: 2200, id: 'running-shoes' };
      if (query.toLowerCase().includes('bag')) {
        product = { name: 'Shield Armour Gym Bag', listPrice: 1299, floorPrice: 1149, id: 'gym-bag' };
      }

      setSimulatorMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'AGENT',
          text: `Found "${product.name}" in merchant catalog. List: ₹${product.listPrice.toLocaleString('en-IN')}, Floor: ₹${product.floorPrice.toLocaleString('en-IN')}. Ready to initiate multi-turn negotiation.`,
          product
        }
      ]);
      setIsChatProcessing(false);
    }, 600);
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = (agent.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (agent.agentId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter || agent.type === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              AI Buyer Agents Registry
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              {agents.length} Registered Entities
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage autonomous AI agents, trust levels, deterministic permission envelopes, and rate limit boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Agent</span>
        </button>
      </div>

      {/* Trust & Activity Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Trusted Entities</span>
          </div>
          <p className="text-2xl font-bold font-display text-foreground">
            {agents.filter(a => a.whitelisted !== false && a.status === 'ACTIVE').length}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            Passed identity checks &amp; compliance handshakes
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-rose-700">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Restricted / Blocked</span>
          </div>
          <p className="text-2xl font-bold font-display text-foreground">
            {agents.filter(a => a.type === 'ADVERSARIAL' || a.status === 'DISABLED' || a.whitelisted === false).length}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            Subject to mandatory firewall interception
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-2 text-accent">
            <Bot className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-body">Protocol Supported</span>
          </div>
          <p className="text-sm font-bold font-mono text-foreground mt-1">
            AgentCommerce-v1
          </p>
          <span className="text-[11px] text-muted-foreground block">
            JSON Schema Discovery &amp; REST Negotiation
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center space-x-1 bg-secondary/70 p-1 rounded-full border border-border self-start md:self-center">
          {['ALL', 'ACTIVE', 'ADVERSARIAL', 'DISABLED'].map((st) => (
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

      {/* Agents Table */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading registered AI buyer agents..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAgentsData} />
        ) : filteredAgents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents found"
            description="No AI buyer agents match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Agent ID</th>
                  <th className="py-3 px-4">Trust Level</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Whitelisted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAgents.map((ag) => {
                  const isAdversarial = ag.type === 'ADVERSARIAL' || ag.agentId.includes('adversarial');
                  const isTrusted = ag.whitelisted !== false && !isAdversarial && ag.status === 'ACTIVE';

                  return (
                    <tr key={ag.agentId} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isAdversarial
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{ag.name}</span>
                            <span className="text-[10px] text-muted-foreground">Registered entity</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground font-medium">
                        {ag.agentId}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={isTrusted ? 'TRUSTED' : isAdversarial ? 'RESTRICTED' : ag.status} size="xs" />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border">
                          {ag.type || 'LEGITIMATE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={ag.status || 'ACTIVE'} size="xs" />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-semibold ${ag.whitelisted !== false ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {ag.whitelisted !== false ? 'Yes ✓' : 'No ✗'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedAgent(ag)}
                            className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => navigate(`/negotiations?agent=${ag.agentId}`)}
                            className="px-3 py-1 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-[11px] font-medium transition-all shadow-xs cursor-pointer flex items-center space-x-1"
                          >
                            <span>Negotiate</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive AI Agent Simulator Assistant */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-body">
              Interactive AI Buyer Agent Assistant
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">AgentCommerce-v1 Simulation</span>
        </div>

        {/* Chat box */}
        <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-3 max-h-72 overflow-y-auto">
          {simulatorMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md rounded-2xl p-3.5 text-xs space-y-2 ${
                m.sender === 'USER'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white text-foreground border border-border shadow-2xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${m.sender === 'USER' ? 'text-primary-foreground/80' : 'text-accent'}`}>
                  {m.sender === 'USER' ? 'You' : 'Autonomous AI Buyer'}
                </span>
                <p className="leading-relaxed">{m.text}</p>
                {m.product && (
                  <div className="p-2.5 bg-secondary/60 rounded-xl border border-border flex items-center justify-between gap-2 mt-2">
                    <div>
                      <span className="font-bold text-foreground block text-[11px]">{m.product.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">List: ₹{m.product.listPrice} &bull; Floor: ₹{m.product.floorPrice}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/negotiations?product=${m.product.id}`)}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[11px] font-medium hover:opacity-90 cursor-pointer shrink-0"
                    >
                      Start
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isChatProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-border rounded-2xl px-3.5 py-2 text-xs text-muted-foreground flex items-center space-x-1.5 shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                <span>AI Buyer querying merchant catalog...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[11px] text-muted-foreground">Try asking:</span>
          {['Looking for running shoes under ₹2,400', 'Need waterproof gym bag under ₹1,200'].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChatMessage(chip)}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-secondary border border-border rounded-full text-foreground cursor-pointer shadow-2xs transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            placeholder="Type shopping request (e.g. 'I need sports gear under ₹2,000')..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
            className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
          />
          <button
            onClick={() => handleSendChatMessage()}
            disabled={!chatInput.trim() || isChatProcessing}
            className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full text-xs font-medium flex items-center space-x-1 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agent Detail Drawer */}
      <Drawer
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name || 'Agent Details'}
      >
        {selectedAgent && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Entity ID</span>
                <span className="font-mono font-bold text-foreground">{selectedAgent.agentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trust Classification</span>
                <StatusBadge status={selectedAgent.type === 'ADVERSARIAL' ? 'RESTRICTED' : 'TRUSTED'} size="xs" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Whitelist Status</span>
                <span className="font-semibold text-emerald-700">{selectedAgent.whitelisted !== false ? 'Whitelisted' : 'Disabled'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Policy Permissions</h4>
              <div className="p-3.5 bg-white border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rate Limit Cap</span>
                  <span className="font-mono font-semibold text-foreground">10 req / min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max Order Value</span>
                  <span className="font-mono font-semibold text-foreground">₹50,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Direct Payment Access</span>
                  <span className="font-semibold text-rose-700 font-mono">DENIED (Gated)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <button
                onClick={() => {
                  const id = selectedAgent.agentId;
                  setSelectedAgent(null);
                  navigate(`/negotiations?agent=${id}`);
                }}
                className="w-full py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Negotiation with this Agent</span>
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Register Agent Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New AI Buyer Agent"
      >
        <form onSubmit={handleRegisterAgent} className="space-y-4 text-xs font-body">
          <div>
            <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Agent ID (Unique Identifier) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. agent_smart_shopper_01"
              value={registerForm.agentId}
              onChange={(e) => setRegisterForm({ ...registerForm, agentId: e.target.value })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Agent Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Shopper AI"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Agent Type
              </label>
              <select
                value={registerForm.type}
                onChange={(e) => setRegisterForm({ ...registerForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="LEGITIMATE">LEGITIMATE</option>
                <option value="ADVERSARIAL">ADVERSARIAL</option>
                <option value="UNTRUSTED">UNTRUSTED</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Whitelist Status
              </label>
              <select
                value={registerForm.whitelisted ? 'true' : 'false'}
                onChange={(e) => setRegisterForm({ ...registerForm, whitelisted: e.target.value === 'true' })}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="true">Whitelisted (Active)</option>
                <option value="false">Restricted (Block)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-secondary/40 border border-border rounded-xl text-muted-foreground text-[11px]">
            New agents will be registered to the merchant store database and evaluated against 10 deterministic firewall boundaries.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-secondary border border-border rounded-full text-xs text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRegistering}
              className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium shadow-xs disabled:opacity-50"
            >
              {isRegistering ? 'Registering...' : 'Register Entity'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
