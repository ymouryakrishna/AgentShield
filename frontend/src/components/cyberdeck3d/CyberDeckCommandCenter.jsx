import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Flame, 
  Maximize2, 
  RefreshCw, 
  Sparkles, 
  Lock, 
  Layers,
  Terminal,
  Activity,
  Cpu,
  Radio
} from 'lucide-react';
import CyberShieldScene from './CyberShieldScene';
import HolographicHudOverlay from './HolographicHudOverlay';
import Card from '../horizon/Card';

export default function CyberDeckCommandCenter({
  mode = 'normal', // 'normal' | 'adversarial' | 'legitimate'
  onRunLegitimate,
  onRunAdversarial,
  isLegitimateRunning = false,
  isAdversarialRunning = false,
  threatCount = 0,
  protectedCount = 0,
}) {
  const [activeDeckMode, setActiveDeckMode] = useState(mode);
  const [activeTab, setActiveTab] = useState('3d-core'); // '3d-core' | 'matrix-telemetry' | 'quantum-invariants'

  useEffect(() => {
    if (isAdversarialRunning) {
      setActiveDeckMode('adversarial');
    } else if (isLegitimateRunning) {
      setActiveDeckMode('legitimate');
    } else {
      setActiveDeckMode(mode);
    }
  }, [mode, isAdversarialRunning, isLegitimateRunning]);

  return (
    <Card extra="overflow-hidden !p-0 border border-slate-200/80 dark:border-white/15 bg-white/80 dark:bg-navy-800/70 backdrop-blur-2xl shadow-xl">
      
      {/* 1. Deck Top Tactical Command Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 dark:bg-navy-900/60">
        
        {/* Left Title & Status */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-display">
                3D WebGL Cyber-Security Command Deck
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                v2.6 Realtime
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Interactive 3D spatial firewall topology, gyroscopic policy rings &amp; real-time threat deflection engine.
            </p>
          </div>
        </div>

        {/* Right Tactical Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveDeckMode('normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeDeckMode === 'normal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-navy-700'
            }`}
          >
            ● STANDBY
          </button>

          <button
            onClick={() => setActiveDeckMode('legitimate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeDeckMode === 'legitimate'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            ✓ SETTLE CORE
          </button>

          <button
            onClick={() => setActiveDeckMode('adversarial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeDeckMode === 'adversarial'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            🚨 THREAT SIM
          </button>

        </div>

      </div>

      {/* 2. 3D WebGL Canvas Layer with Holographic HUD Overlays */}
      <div className="relative w-full h-[380px] sm:h-[440px] bg-gradient-to-b from-slate-900/5 via-indigo-950/10 to-slate-900/20 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 overflow-hidden">
        
        {/* Subtle Cyber Grid Background Matrix */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* 3D WebGL Scene */}
        <CyberShieldScene mode={activeDeckMode} />

        {/* Holographic HUD Layer Over WebGL */}
        <HolographicHudOverlay
          mode={activeDeckMode}
          onTriggerLegitimate={onRunLegitimate}
          onTriggerAdversarial={onRunAdversarial}
          isLegitimateRunning={isLegitimateRunning}
          isAdversarialRunning={isAdversarialRunning}
          threatCount={threatCount}
          protectedCount={protectedCount}
        />
      </div>

      {/* 3. Tactical Quick Action Controls & Telemetry Footers */}
      <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-navy-900/70 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Policy Invariant Vault */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase block">Deterministic Floor</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">₹2,200 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(Hard Floor)</span></span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ENFORCED
          </span>
        </div>

        {/* Metric 2: Bounded Round Envelope */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase block">Smart Bundling</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">+ Free Socks <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">(&ge; ₹2,299)</span></span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            ACTIVE
          </span>
        </div>

        {/* Metric 3: Razorpay Test Gate */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase block">Threat Defense</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">0 Floor Breaches <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">(100% Blocked)</span></span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            SHIELDED
          </span>
        </div>

      </div>

    </Card>
  );
}
