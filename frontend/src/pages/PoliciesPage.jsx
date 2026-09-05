import React, { useEffect, useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Save, 
  Lock, 
  Scale, 
  Percent, 
  Clock, 
  Gift, 
  Check, 
  RefreshCw,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('running-shoes');
  const [activePolicy, setActivePolicy] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPolicies();
      if (res.success) {
        const list = res.productEnvelopes || res.policies || [];
        setPolicies(list);
        const found = list.find(p => p.productId === selectedProductId || p.id === selectedProductId) || list[0];
        setActivePolicy(found ? { ...found } : null);
        setError(null);
      } else {
        setError('Failed to fetch merchant policies.');
      }
    } catch (e) {
      setError(e.message || 'Unable to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [selectedProductId]);

  const handleSelectProduct = (pId) => {
    setSelectedProductId(pId);
    const found = policies.find(p => p.productId === pId || p.id === pId);
    if (found) setActivePolicy({ ...found });
  };

  const handleSave = async () => {
    if (!activePolicy) return;
    setIsSaving(true);
    try {
      const productId = activePolicy.productId || activePolicy.id;
      const res = await api.updatePolicy(productId, {
        productId,
        floorPrice: activePolicy.floorPrice,
        maxDiscountPercent: activePolicy.maxDiscountPercent,
        maxNegotiationRounds: activePolicy.maxNegotiationRounds || activePolicy.maxRounds || 3,
        maxOrderValue: activePolicy.maxOrderValue || 50000,
        negotiationEnabled: activePolicy.negotiationEnabled !== false,
        promptInjectionProtection: activePolicy.promptInjectionProtection !== false,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (e) {
      alert(e.message || 'Failed to save policy.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading merchant policy envelopes &amp; margin boundaries..." />;
  }

  if (error && policies.length === 0) {
    return <ErrorState message={error} onRetry={loadPolicies} />;
  }

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Merchant Policies &amp; Margins
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Deterministic Enforcement
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure hard floor prices, discount limits, and concession rules. The deterministic Policy Engine enforces these strictly on all inbound AI requests.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-secondary/80 border border-border px-3 py-1.5 rounded-full text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-accent" />
          <span>AI Agents Cannot Modify Merchant Rules</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List of Products (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-border rounded-2xl p-4 space-y-2 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block px-2 pb-2">
            Select Product Policy Envelope:
          </span>

          {policies.map((p) => {
            const pid = p.productId || p.id;
            const isSelected = selectedProductId === pid;
            return (
              <button
                key={pid}
                onClick={() => handleSelectProduct(pid)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent/10 border-accent text-accent shadow-2xs font-semibold'
                    : 'bg-secondary/40 border-border text-foreground hover:border-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">{p.productName || p.name || pid}</span>
                  <span className="text-xs font-mono font-bold">
                    ₹{(p.listedPrice || p.listPrice || 2499).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-muted-foreground mt-1 font-mono">
                  <span>Floor: ₹{p.floorPrice}</span>
                  <span>Max Disc: {p.maxDiscountPercent}%</span>
                  <span>{p.maxNegotiationRounds || p.maxRounds || 3} Rds</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Policy Envelope Editor (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
          {activePolicy ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight font-display">
                    {activePolicy.productName || activePolicy.name || activePolicy.productId}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    Base Listed Price: ₹{(activePolicy.listedPrice || activePolicy.listPrice || 2499).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-primary-foreground" />
                      <span>Policy Saved ✓</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Updating...' : 'Save Policy'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sliders & Fields */}
              <div className="space-y-5">
                
                {/* 1. Floor Price */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold flex items-center space-x-1.5">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      <span>Minimum Allowed Hard Floor Price</span>
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      ₹{Number(activePolicy.floorPrice || 2200).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={Math.round((activePolicy.listedPrice || activePolicy.listPrice || 2499) * 0.5)}
                    max={activePolicy.listedPrice || activePolicy.listPrice || 2499}
                    step={10}
                    value={activePolicy.floorPrice || 2200}
                    onChange={(e) => setActivePolicy({ ...activePolicy, floorPrice: Number(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Any agent offer below ₹{Number(activePolicy.floorPrice || 2200).toLocaleString('en-IN')} is blocked deterministically.
                  </p>
                </div>

                {/* 2. Max Discount Percentage */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold flex items-center space-x-1.5">
                      <Percent className="w-4 h-4 text-accent" />
                      <span>Maximum Allowed Discount Percentage</span>
                    </span>
                    <span className="text-base font-bold font-mono text-accent">
                      {activePolicy.maxDiscountPercent || 12}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={0.5}
                    value={activePolicy.maxDiscountPercent || 12}
                    onChange={(e) => setActivePolicy({ ...activePolicy, maxDiscountPercent: Number(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* 3. Negotiation Rounds Limit */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Maximum Negotiation Rounds</span>
                    </span>
                    <span className="text-base font-bold font-mono text-foreground">
                      {activePolicy.maxNegotiationRounds || activePolicy.maxRounds || 3} Rounds
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={activePolicy.maxNegotiationRounds || activePolicy.maxRounds || 3}
                    onChange={(e) => setActivePolicy({ ...activePolicy, maxNegotiationRounds: Number(e.target.value), maxRounds: Number(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* 4. Security Toggles */}
                <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Security &amp; Policy Protections
                  </span>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground block">Prompt Injection Interception</span>
                      <span className="text-[11px] text-muted-foreground">Scan prompt context for jailbreaks &amp; price overrides</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={activePolicy.promptInjectionProtection !== false}
                      onChange={(e) => setActivePolicy({ ...activePolicy, promptInjectionProtection: e.target.checked })}
                      className="rounded text-accent focus:ring-accent border-border"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                    <div>
                      <span className="font-semibold text-foreground block">Negotiation Enabled</span>
                      <span className="text-[11px] text-muted-foreground">Allow autonomous AI buyer requests on this item</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={activePolicy.negotiationEnabled !== false}
                      onChange={(e) => setActivePolicy({ ...activePolicy, negotiationEnabled: e.target.checked })}
                      className="rounded text-accent focus:ring-accent border-border"
                    />
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground text-xs">
              Select a product to view and adjust its deterministic negotiation envelope.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
