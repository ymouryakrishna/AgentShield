import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bot, 
  ShieldCheck, 
  ShieldAlert, 
  Receipt, 
  History, 
  Sliders, 
  CreditCard, 
  ShoppingBag, 
  Activity, 
  Settings, 
  Sparkles, 
  ArrowRight,
  X,
  Code
} from 'lucide-react';

const QUICK_LINKS = [
  { name: 'Overview / Dashboard', path: '/', icon: Activity, category: 'Navigation' },
  { name: 'AI Buyer Agents', path: '/agents', icon: Bot, category: 'Commerce' },
  { name: 'Negotiation Management', path: '/negotiations', icon: Sparkles, category: 'Commerce' },
  { name: 'Transactions & Orders', path: '/transactions', icon: CreditCard, category: 'Commerce' },
  { name: 'Commerce Firewall', path: '/firewall', icon: ShieldCheck, category: 'Security' },
  { name: 'Security Events', path: '/security-events', icon: ShieldAlert, category: 'Security' },
  { name: 'Negotiation Receipts', path: '/receipts', icon: Receipt, category: 'Trust' },
  { name: 'Audit Trail', path: '/audit', icon: History, category: 'Trust' },
  { name: 'Growth Analytics', path: '/analytics', icon: Activity, category: 'Growth' },
  { name: 'Merchant Catalog', path: '/catalog', icon: ShoppingBag, category: 'Catalog' },
  { name: 'AI-Readable Catalog (JSON)', path: '/catalog/ai', icon: Code, category: 'Catalog' },
  { name: 'Merchant Policies', path: '/policies', icon: Sliders, category: 'Configuration' },
  { name: 'Agent Permissions', path: '/permissions', icon: Bot, category: 'Configuration' },
  { name: 'Payment & API Integrations', path: '/integrations', icon: CreditCard, category: 'System' },
  { name: 'Application Settings', path: '/settings', icon: Settings, category: 'System' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredLinks = QUICK_LINKS.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % (filteredLinks.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filteredLinks.length) % (filteredLinks.length || 1));
    } else if (e.key === 'Enter' && filteredLinks[selectedIndex]) {
      e.preventDefault();
      navigate(filteredLinks[selectedIndex].path);
      onClose(false);
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/50 backdrop-blur-xs font-body animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => onClose(false)} 
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-white/10 rounded-[20px] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 dark:border-white/10 gap-2.5 bg-slate-50/60 dark:bg-navy-900/60">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search transactions, agents, receipts, policies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={() => onClose(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-navy-700 transition-colors cursor-pointer"
          >
            <kbd className="text-[10px] font-mono bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/10">ESC</kbd>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredLinks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredLinks.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose(false);
                    setQuery('');
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-navy-900 text-slate-500 dark:text-slate-400'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={isSelected ? 'text-white font-bold' : 'text-slate-900 dark:text-white'}>
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSelected 
                        ? 'bg-white/20 border-white/30 text-white' 
                        : 'bg-slate-100 dark:bg-navy-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-navy-900/80 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <span><kbd className="bg-white dark:bg-navy-800 px-1 py-0.5 rounded border border-slate-200 dark:border-white/10 font-mono text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-white dark:bg-navy-800 px-1 py-0.5 rounded border border-slate-200 dark:border-white/10 font-mono text-[10px]">↵</kbd> Select</span>
          </div>
          <span className="font-mono text-[10px]">AgentShield Trust Engine</span>
        </div>

      </div>
    </div>
  );
}
