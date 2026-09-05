'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Activity, 
  MessageSquareCode, 
  Receipt, 
  History, 
  ShoppingBag, 
  Sliders, 
  Play, 
  Flame,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: Activity },
    { name: 'Demo Center', href: '/demo', icon: Play, highlight: true },
    { name: 'Live Negotiation', href: '/negotiate', icon: MessageSquareCode },
    { name: 'Commerce Firewall', href: '/firewall', icon: ShieldCheck },
    { name: 'Receipts', href: '/receipts', icon: Receipt },
    { name: 'Audit Trail', href: '/audit', icon: History },
    { name: 'AI Catalog', href: '/catalog', icon: ShoppingBag },
    { name: 'Policies', href: '/policies', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-glow-emerald flex items-center justify-center">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg text-white tracking-tight">Agent<span className="text-emerald-400">Shield</span></span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    Track 01
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">The Trust Layer for AI Commerce</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : item.highlight
                      ? 'text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Badge: Razorpay Test Mode & Quick Demo CTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 text-[11px] font-medium">Razorpay Test Mode</span>
              <Lock className="w-3 h-3 text-slate-400" />
            </div>

            <Link
              href="/demo"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs shadow-glow-emerald transition-all transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Judge Demo (30s)</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="lg:hidden flex items-center space-x-2 px-4 py-2 overflow-x-auto border-t border-slate-800/60 bg-[#090D16]/95">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-1 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
