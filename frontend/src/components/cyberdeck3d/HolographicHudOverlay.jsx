import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  Cpu, 
  Lock, 
  Zap, 
  Maximize2, 
  Activity, 
  KeyRound, 
  Eye, 
  Sparkles 
} from 'lucide-react';

export default function HolographicHudOverlay({ 
  mode = 'normal', 
  onTriggerLegitimate, 
  onTriggerAdversarial,
  isLegitimateRunning,
  isAdversarialRunning,
  threatCount = 0,
  protectedCount = 0
}) {
  const isThreat = mode === 'adversarial';
  const isSuccess = mode === 'legitimate';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-5 z-20">
      
      {/* 1. Top HUD Row: Status Pill, Threat DEFCON Meter & Node Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: Tactical DEFCON Status */}
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg border backdrop-blur-md shadow-xs ${
            isThreat
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 animate-pulse'
              : isSuccess
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
              : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
          }`}>
            <Radio className="w-4 h-4" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${
                isThreat ? 'text-rose-500 dark:text-rose-400' : isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                {isThreat ? 'DEFCON 1 • THREAT NEUTRALIZED' : isSuccess ? 'DEFCON 4 • SETTLEMENT VERIFIED' : 'DEFCON 5 • SHIELD ENGAGED'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Deterministic Invariant Gate • 10/10 Checks Active
            </span>
          </div>
        </div>

        {/* Right: Real-time HUD Node Status */}
        <div className="flex items-center space-x-2 self-start sm:self-auto font-mono text-[10px]">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/60 dark:bg-navy-900/80 border border-slate-700/40 text-slate-300 backdrop-blur-md flex items-center space-x-1.5">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>CORE: 60 FPS</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/60 dark:bg-navy-900/80 border border-slate-700/40 text-slate-300 backdrop-blur-md flex items-center space-x-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>POLICY: BOUNDED</span>
          </div>
        </div>

      </div>

      {/* 2. Middle HUD Reticle & Crosshair Overlays */}
      <div className="flex items-center justify-between pointer-events-none opacity-40 select-none">
        <div className="w-8 h-8 border-l-2 border-t-2 border-indigo-500/60 rounded-tl-lg" />
        <div className="text-[9px] font-mono text-indigo-400/80 uppercase tracking-widest">
          [ 3D SPATIAL WEBGL TELEMETRY MATRIX ]
        </div>
        <div className="w-8 h-8 border-r-2 border-t-2 border-indigo-500/60 rounded-tr-lg" />
      </div>

      {/* 3. Bottom HUD Row: Quick Spatial Telemetry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2 border-t border-slate-200/20 dark:border-white/10">
        
        {/* Left: Bounded Parameter Status */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
          <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-navy-900/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-md font-semibold">
            FLOOR: ₹2,200
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-navy-900/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-md font-semibold">
            MAX DISCOUNT: 12.0%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-navy-900/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-md font-semibold">
            MAX ROUNDS: 3
          </span>
        </div>

        {/* Right: Drag to Rotate Prompt */}
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-navy-900/60 border border-slate-200/60 dark:border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm self-end">
          <Eye className="w-3 h-3 text-indigo-500" />
          <span>Interactive 3D: Click &amp; Drag Orbit</span>
        </div>

      </div>

    </div>
  );
}
