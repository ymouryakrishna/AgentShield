import React from 'react';
import Card from './Card';

export default function MiniStatistics({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-500',
  badge,
  badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  extra = '',
}) {
  return (
    <Card extra={`!p-5 ${extra}`}>
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] shrink-0 shadow-xs ${iconBg}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              {title}
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {value}
            </h4>
            {subtext && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {badge && (
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start ${badgeColor}`}>
            {badge}
          </div>
        )}
      </div>
    </Card>
  );
}
