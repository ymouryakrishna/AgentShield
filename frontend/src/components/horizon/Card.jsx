import React from 'react';

export default function Card({ children, extra = '', className = '', ...rest }) {
  return (
    <div
      className={`relative flex flex-col bg-white/70 dark:bg-navy-800/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[20px] p-6 shadow-sm text-slate-900 dark:text-white transition-all duration-300 ${extra} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
