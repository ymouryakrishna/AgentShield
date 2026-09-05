import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Bot,
  MessageSquare, 
  ShieldCheck, 
  Receipt, 
  History, 
  ShoppingBag, 
  Sliders, 
  Play, 
  CreditCard,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Demo Center', path: '/demo', icon: Play, highlight: true },
    { name: 'AI Buyer', path: '/ai-buyer', icon: Bot },
    { name: 'Negotiation', path: '/negotiation', icon: MessageSquare },
    { name: 'Firewall', path: '/firewall', icon: ShieldCheck },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Receipts', path: '/receipts', icon: Receipt },
    { name: 'Audit Trail', path: '/audit', icon: History },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Policies', path: '/policies', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground hover:opacity-90 transition-opacity">
              <span className="text-accent text-xl">✦</span>
              <span>AgentShield</span>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider bg-secondary text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                Track 01
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/dashboard' && item.path !== '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-foreground text-background font-semibold shadow-2xs'
                      : item.highlight
                      ? 'text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Badge & Demo CTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 bg-secondary/80 border border-border px-2.5 py-1 rounded-full text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-foreground font-medium text-[11px]">Razorpay Test Mode</span>
              <Lock className="w-3 h-3 text-muted-foreground" />
            </div>

            <Link
              to="/demo"
              className="flex items-center space-x-1.5 bg-primary hover:opacity-90 text-primary-foreground font-medium px-4 py-1.5 rounded-full text-xs transition-all shadow-xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Judge Demo</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Responsive Horizontal Scroll Nav for Tablet/Mobile */}
      <div className="xl:hidden flex items-center space-x-1.5 px-4 py-2 overflow-x-auto border-t border-border/60 bg-secondary/30">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-1 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-foreground text-background font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground bg-white border border-border/70'
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
