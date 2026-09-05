import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function RevenueStoryCard({ metrics }) {
  const baseAOV = metrics?.baselineAOV || metrics?.baseCatalogAOV || 1499;
  const negAOV = metrics?.negotiatedAOV || 2149;
  const uplift = metrics?.aovUplift ?? metrics?.aovUpliftPercent ?? 43.4;

  return (
    <div className="p-6 rounded-[20px] bg-white/70 dark:bg-navy-800/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Track 01 • AI Growth &amp; Agentic Commerce
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Autonomous AI Negotiation Drives Higher Basket Value
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Instead of losing high-intent buyers to rigid price points, AgentShield empowers autonomous agents to negotiate within strictly bounded discount envelopes — securing positive margin uplift and high-attachment bundle concessions.
          </p>
        </div>

        {/* Dynamic AOV Uplift Calculation Badge */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50/90 dark:bg-navy-900/70 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Fixed Price Baseline</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
              ₹{Number(baseAOV).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Catalog Baseline</span>
          </div>

          <div className="text-slate-400 font-bold text-lg">&rarr;</div>

          <div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">Negotiated Outcome</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
              ₹{Number(negAOV).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+ Free Bundle Gift</span>
          </div>

          <div className="pl-3 border-l border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">AOV Uplift</span>
            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              <TrendingUp className="w-4 h-4" />
              <span>+{uplift}%</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Real-time dynamic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
