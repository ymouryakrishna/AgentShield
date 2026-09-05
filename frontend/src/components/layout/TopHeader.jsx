import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Sliders, 
  Settings, 
  Menu,
  Store,
  Sun,
  Moon,
  ExternalLink,
  Lock,
  Activity
} from 'lucide-react';

export default function TopHeader({ 
  onOpenCommandPalette, 
  onOpenNotifications, 
  onOpenHelp, 
  onToggleMobileSidebar,
  notificationCount = 0,
  isBackendHealthy = true 
}) {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
        localStorage.getItem('agentshield_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agentshield_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agentshield_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-20 px-6 flex items-center justify-between bg-white/80 dark:bg-navy-800/60 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm transition-all duration-300 font-body">
      
      {/* 1. Left: Branding & Environment */}
      <div className="flex items-center space-x-3.5 shrink-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100/80 dark:bg-navy-900/80 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-navy-700 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
          {/* Deep Purple Shield Badge */}
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-[0_0_12px_rgba(99,102,241,0.35)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>

          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            AgentShield
          </span>
        </Link>

        {/* Environment Pill */}
        <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          TEST MODE
        </span>
      </div>

      {/* 2. Center: Omnibar Search */}
      <div className="flex-1 max-w-[460px] mx-4 hidden md:block">
        <div
          onClick={() => onOpenCommandPalette(true)}
          className="w-96 md:w-[460px] flex items-center gap-3 bg-slate-100/70 dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-full px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white dark:focus-within:bg-navy-900 transition-all cursor-pointer group"
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
          <input
            type="text"
            placeholder="Search transactions, agents, receipts..."
            readOnly
            className="bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none w-full cursor-pointer"
          />
          <kbd className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 shadow-sm rounded-md px-1.5 py-0.5 text-xs text-slate-500 font-semibold shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Status & Profile Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Mobile Search Trigger */}
        <button
          onClick={() => onOpenCommandPalette(true)}
          className="md:hidden p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle (Dark/Light) */}
        <button
          onClick={toggleDarkMode}
          className="text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors relative cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications (Bell with Active Ping) */}
        <button
          onClick={() => onOpenNotifications(true)}
          className="text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors relative cursor-pointer"
          title="Notifications & Security Alerts"
        >
          <Bell className="w-5 h-5 stroke-[1.8]" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-navy-800 animate-pulse shadow-sm" />
        </button>

        {/* Help & Architecture Trigger */}
        <button
          onClick={() => onOpenHelp(true)}
          className="text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors relative cursor-pointer"
          title="System Help & Architecture"
        >
          <HelpCircle className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Subtle Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            {/* Avatar ("AS" gradient badge) */}
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-brand-500 shadow-sm shrink-0">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-navy-800 text-indigo-600 dark:text-white flex items-center justify-center font-bold text-xs">
                AS
              </div>
            </div>

            {/* Stacked Merchant Label */}
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Acme Sports
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Merchant Admin
              </span>
            </div>

            {/* Chevron Icon */}
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                profileDropdownOpen ? 'rotate-180 text-indigo-600' : ''
              }`} 
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div 
              className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-navy-800/95 border border-slate-200/80 dark:border-white/10 rounded-[20px] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/10">
                <span className="text-xs font-bold text-slate-900 dark:text-white block font-display">Acme Sports Store</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">ID: merchant_acme_2026</span>
              </div>

              <div className="py-1.5 space-y-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/policies');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Merchant Policies</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/integrations');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Razorpay API Settings</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                <div className="px-3 py-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Backend Status</span>
                  <span className={`font-bold flex items-center gap-1.5 ${isBackendHealthy ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                    {isBackendHealthy ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
