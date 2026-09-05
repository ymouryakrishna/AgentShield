'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  variant?: 'emerald' | 'cyan' | 'crimson' | 'amber' | 'slate';
}

export default function MetricCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  variant = 'emerald'
}: MetricCardProps) {
  const borderStyles = {
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 bg-slate-900/90',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 bg-slate-900/90',
    crimson: 'border-red-500/20 hover:border-red-500/40 bg-slate-900/90',
    amber: 'border-amber-500/20 hover:border-amber-500/40 bg-slate-900/90',
    slate: 'border-slate-800 hover:border-slate-700 bg-slate-900/90',
  }[variant];

  const iconBgStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
    crimson: 'bg-red-500/15 text-red-400',
    amber: 'bg-amber-500/15 text-amber-400',
    slate: 'bg-slate-800 text-slate-300',
  }[variant];

  return (
    <div className={`p-5 rounded-2xl border ${borderStyles} transition-all duration-300 shadow-card-elevated relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
          <p className="text-2xl font-black text-white mt-1.5 tracking-tight">{value}</p>
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgStyles} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {trend && (
          <div className={`flex items-center space-x-1 font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        )}
        {subtext && (
          <span className="text-slate-400 text-[11px] truncate">{subtext}</span>
        )}
      </div>
    </div>
  );
}
