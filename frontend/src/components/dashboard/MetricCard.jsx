import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  variant = 'emerald'
}) {
  const iconBgStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20',
    cyan: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20',
    crimson: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20',
    slate: 'bg-slate-100 text-slate-700 dark:bg-navy-900 dark:text-slate-200',
  }[variant] || 'bg-slate-100 text-slate-700 dark:bg-navy-900 dark:text-slate-200';

  return (
    <div className="p-5 rounded-[20px] bg-white/70 dark:bg-navy-800/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">{title}</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
        </div>

        <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center ${iconBgStyles} transition-transform group-hover:scale-105 duration-200 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60 dark:border-white/10">
        {trend && (
          <div className={`flex items-center space-x-1 font-bold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        )}
        {subtext && (
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate ml-auto">{subtext}</span>
        )}
      </div>
    </div>
  );
}
