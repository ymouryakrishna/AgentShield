import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Bot, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  ShieldAlert, 
  Receipt, 
  History, 
  TrendingUp, 
  ShoppingBag, 
  Code, 
  Sliders, 
  Lock, 
  Settings, 
  Layers, 
  CheckCircle2, 
  X,
  Store
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: null,
    items: [
      { name: 'Overview', path: '/', icon: Activity, exact: true },
    ]
  },
  {
    title: 'Commerce',
    items: [
      { name: 'AI Buyers', path: '/agents', icon: Bot },
      { name: 'Negotiations', path: '/negotiations', icon: Sparkles },
      { name: 'Transactions', path: '/transactions', icon: CreditCard },
    ]
  },
  {
    title: 'Security',
    items: [
      { name: 'Commerce Firewall', path: '/firewall', icon: ShieldCheck },
      { name: 'Security Events', path: '/security-events', icon: ShieldAlert },
    ]
  },
  {
    title: 'Trust & Physics',
    items: [
      { name: 'Receipts', path: '/receipts', icon: Receipt },
      { name: 'Audit Trail', path: '/audit', icon: History },
      { name: 'Anti-Gravity Playground', path: '/antigravity', icon: Sparkles },
    ]
  },
  {
    title: 'Growth & SaaS',
    items: [
      { name: 'Analytics', path: '/analytics', icon: TrendingUp },
      { name: 'Neuralyn SaaS Landing', path: '/neuralyn', icon: Sparkles },
    ]
  },
  {
    title: 'Catalog',
    items: [
      { name: 'Products', path: '/catalog', icon: ShoppingBag, exact: true },
      { name: 'AI Catalog', path: '/catalog/ai', icon: Code },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Merchant Policies', path: '/policies', icon: Sliders },
      { name: 'Agent Permissions', path: '/permissions', icon: Lock },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'API / Integration', path: '/integrations', icon: Store },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar({ isMobileOpen, onCloseMobile, isBackendConnected = true }) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/70 dark:bg-navy-800/60 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/10 font-body select-none">
      
      {/* Top Header Logo on mobile drawer */}
      <div className="lg:hidden p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white font-display">AgentShield</span>
        </div>
        <button 
          onClick={onCloseMobile} 
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {group.title && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {group.title}
              </h4>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : (location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/'));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status Section */}
      <div className="p-3.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-navy-900/40 space-y-2">
        <div className="p-3 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-slate-200/80 dark:border-white/10 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Backend API</span>
            <span className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isBackendConnected ? 'Connected' : 'Offline'}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Razorpay Gateway</span>
            <span className="text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Test Mode
            </span>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
