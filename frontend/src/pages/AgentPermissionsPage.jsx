import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Bot, 
  ShieldCheck, 
  ShieldAlert, 
  Save, 
  Check, 
  Search, 
  Sliders, 
  Clock, 
  CreditCard, 
  RefreshCw,
  Gift
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function AgentPermissionsPage() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('agent_demo_legitimate');
  const [activePermissions, setActivePermissions] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAgents();
      if (res.success) {
        setAgents(res.agents || []);
        const found = res.agents?.find(a => a.agentId === selectedAgentId) || res.agents?.[0];
        if (found) {
          setActivePermissions({
            agentId: found.agentId,
            name: found.name,
            whitelisted: found.whitelisted !== false,
            status: found.status || 'ACTIVE',
            maxTransactionValue: 50000,
            maxRequestsPerMin: 10,
            maxDiscountPercent: 12,
            negotiationEnabled: true,
            bundleAllowed: true,
            directPaymentAccess: false,
          });
        }
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch agent permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSelectAgent = (ag) => {
    setSelectedAgentId(ag.agentId);
    setActivePermissions({
      agentId: ag.agentId,
      name: ag.name,
      whitelisted: ag.whitelisted !== false,
      status: ag.status || 'ACTIVE',
      maxTransactionValue: 50000,
      maxRequestsPerMin: 10,
      maxDiscountPercent: 12,
      negotiationEnabled: true,
      bundleAllowed: true,
      directPaymentAccess: false,
    });
  };

  const handleSavePermissions = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 400);
  };

  if (isLoading) {
    return <LoadingState message="Loading agent deterministic access controls &amp; permissions..." />;
  }

  if (error && agents.length === 0) {
    return <ErrorState message={error} onRetry={fetchAgents} />;
  }

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Agent Permissions &amp; Access Controls
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              {agents.length} Entities Controlled
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure transaction ceilings, discount limits, request rate quotas, and whitelist states for AI buyer entities.
          </p>
        </div>

        <button
          onClick={handleSavePermissions}
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Permissions Saved ✓</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Agent Permissions'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Agent List (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-border rounded-2xl p-4 space-y-2 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block px-2 pb-2">
            Select Buyer Agent Entity:
          </span>

          {agents.map((ag) => {
            const isSelected = selectedAgentId === ag.agentId;
            const isAdversarial = ag.type === 'ADVERSARIAL' || ag.agentId.includes('adversarial');

            return (
              <button
                key={ag.agentId}
                onClick={() => handleSelectAgent(ag)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent/10 border-accent text-accent shadow-2xs font-semibold'
                    : 'bg-secondary/40 border-border text-foreground hover:border-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">{ag.name}</span>
                  <StatusBadge status={isAdversarial ? 'RESTRICTED' : 'TRUSTED'} size="xs" />
                </div>
                <div className="flex items-center space-x-3 text-[10px] text-muted-foreground mt-1 font-mono">
                  <span>ID: {ag.agentId}</span>
                  <span>{ag.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Permission Configuration (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
          {activePermissions ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight font-display">
                    {activePermissions.name}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">Entity ID: {activePermissions.agentId}</span>
                </div>

                <StatusBadge status={activePermissions.whitelisted ? 'ACTIVE' : 'DISABLED'} size="xs" />
              </div>

              {/* Controls */}
              <div className="space-y-4 text-xs">
                
                {/* 1. Whitelist / Access Toggle */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">Registry Whitelist Active</span>
                    <span className="text-[11px] text-muted-foreground">Allows agent to connect and query catalog endpoints</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activePermissions.whitelisted}
                    onChange={(e) => setActivePermissions({ ...activePermissions, whitelisted: e.target.checked })}
                    className="rounded text-accent focus:ring-accent border-border"
                  />
                </div>

                {/* 2. Maximum Transaction Limit */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Max Single-Order Transaction Cap</span>
                    <span className="font-mono font-bold text-foreground">₹{Number(activePermissions.maxTransactionValue).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={100000}
                    step={5000}
                    value={activePermissions.maxTransactionValue}
                    onChange={(e) => setActivePermissions({ ...activePermissions, maxTransactionValue: Number(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* 3. Rate Limit Boundary */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Rate Limit Ceiling (Requests / Minute)</span>
                    <span className="font-mono font-bold text-accent">{activePermissions.maxRequestsPerMin} req / min</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={1}
                    value={activePermissions.maxRequestsPerMin}
                    onChange={(e) => setActivePermissions({ ...activePermissions, maxRequestsPerMin: Number(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* 4. Direct Payment Gating Notice */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                  <div>
                    <span className="font-bold block">Direct Payment Gate</span>
                    <span className="text-[11px] text-emerald-900">LLM cannot trigger payment directly; Policy Authorization Token is mandatory.</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    ENFORCED
                  </span>
                </div>

              </div>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground text-xs">
              Select an agent entity to view and configure its permission envelope.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
