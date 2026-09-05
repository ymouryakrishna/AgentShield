import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard, 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from './Card';

const ACTION_CONFIG = {
  ATTACK_DETECTED: {
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    icon: AlertTriangle,
    label: 'ATTACK_DETECTED',
  },
  REQUEST_BLOCKED: {
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    icon: ShieldAlert,
    label: 'REQUEST_BLOCKED',
  },
  POLICY_BLOCKED: {
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    icon: ShieldAlert,
    label: 'POLICY_BLOCKED',
  },
  OFFER_COUNTERED: {
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    icon: KeyRound,
    label: 'OFFER_COUNTERED',
  },
  COUNTER_OFFER: {
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    icon: KeyRound,
    label: 'COUNTER_OFFER',
  },
  PAYMENT_VERIFIED: {
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    icon: CreditCard,
    label: 'PAYMENT_VERIFIED',
  },
  PAYMENT_AUTHORIZED: {
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    icon: ShieldCheck,
    label: 'PAYMENT_AUTHORIZED',
  },
  PAYMENT_CREATED: {
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    icon: CreditCard,
    label: 'PAYMENT_CREATED',
  },
  RECEIPT_CREATED: {
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    icon: CheckCircle2,
    label: 'RECEIPT_CREATED',
  },
  CONSENT_RECEIVED: {
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    icon: ShieldCheck,
    label: 'CONSENT_RECEIVED',
  },
  AGENT_REQUEST: {
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    icon: KeyRound,
    label: 'AGENT_REQUEST',
  },
  BUYER_CONNECTED: {
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    icon: KeyRound,
    label: 'BUYER_CONNECTED',
  },
};

export default function ComplexTable({
  logs = [],
  isLoading = false,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const filters = ['ALL', 'SUCCESS', 'BLOCKED', 'WARNING'];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const status = log.status || log.result || 'INFO';
      
      if (activeFilter !== 'ALL') {
        if (activeFilter === 'BLOCKED') {
          const isBlocked = status === 'BLOCKED' || log.decision === 'BLOCK' || log.action === 'ATTACK_DETECTED' || log.action === 'REQUEST_BLOCKED';
          if (!isBlocked) return false;
        } else if (activeFilter === 'SUCCESS') {
          const isSuccess = status === 'SUCCESS' || log.decision === 'ALLOW' || log.decision === 'SETTLE';
          if (!isSuccess) return false;
        } else if (activeFilter === 'WARNING') {
          if (status !== 'WARNING') return false;
        }
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const agent = (log.agentId || log.actor || '').toLowerCase();
        const session = (log.sessionId || log.relatedSessionId || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const reason = (log.reason || '').toLowerCase();
        const eventId = (log.eventId || log.id || '').toLowerCase();
        if (!agent.includes(q) && !session.includes(q) && !action.includes(q) && !reason.includes(q) && !eventId.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [logs, activeFilter, searchQuery]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (ts) => {
    if (!ts) return '--:--:--';
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return ts;
    }
  };

  return (
    <Card extra="overflow-hidden !p-0">
      
      {/* Table Header Container */}
      <div className="p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Chronological Audit Trail
          </h3>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
            Immutable timeline recording buyer handshakes, firewall decisions, and Razorpay cryptographic seals.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent, session, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-slate-100/80 dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f
                    ? f === 'BLOCKED'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-60 cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Refreshing' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Table Data Area */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-navy-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
              <th className="py-3.5 px-5">Event ID &amp; Time</th>
              <th className="py-3.5 px-5">Agent Identity</th>
              <th className="py-3.5 px-5">Action &amp; Decision</th>
              <th className="py-3.5 px-5">Diagnostic Summary / Reason</th>
              <th className="py-3.5 px-5 text-right">Cryptographic Seal / Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/5 font-body text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  {isLoading ? 'Fetching chronological telemetry records...' : 'No audit entries match your filter.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const logKey = log.eventId || log.id || log._id || Math.random().toString();
                const isAdversarial = (log.agentId || '').includes('adversarial') || log.action === 'ATTACK_DETECTED' || log.action === 'REQUEST_BLOCKED';
                const actionConf = ACTION_CONFIG[log.action] || {
                  color: 'bg-slate-100 text-slate-700 dark:bg-navy-900 dark:text-slate-300',
                  icon: KeyRound,
                  label: log.action || 'EVENT',
                };
                const ActionIcon = actionConf.icon;
                const isExpanded = expandedLogId === logKey;

                return (
                  <React.Fragment key={logKey}>
                    <tr 
                      className={`hover:bg-slate-100/60 dark:hover:bg-navy-700/40 transition-colors ${
                        isAdversarial ? 'bg-rose-500/[0.04]' : ''
                      }`}
                    >
                      {/* 1. Event ID & Timestamp */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {log.eventId || log.id || 'AUD-LOG'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* 2. Agent Identity */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {log.agentId === 'LegitimateShoppingAgent' || log.agentId === 'agent_demo_legitimate'
                              ? 'Agent A (Smart Shopper)'
                              : log.agentId === 'AdversarialAgent' || log.agentId === 'agent_demo_adversarial'
                              ? 'Agent B (Red Team)'
                              : log.agentId || log.actor || 'SYSTEM'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                              isAdversarial
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {log.agentId || log.actor || 'SYSTEM'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Action & Decision */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${actionConf.color}`}>
                          <ActionIcon className="w-3 h-3" />
                          <span>{actionConf.label}</span>
                        </span>
                      </td>

                      {/* 4. Diagnostic Summary / Reason */}
                      <td className="py-3.5 px-5 max-w-md">
                        <div className="flex flex-col">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                            {log.reason}
                          </p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : logKey)}
                              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1 mt-1 cursor-pointer w-fit"
                            >
                              <span>{isExpanded ? 'Hide Raw Metadata' : 'Inspect Details'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 5. Cryptographic Seal / Session ID */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          {log.sessionId ? (
                            <div className="flex items-center space-x-1">
                              <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                                {log.sessionId}
                              </span>
                              <button
                                onClick={() => handleCopy(logKey, log.sessionId)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer"
                                title="Copy session ID"
                              >
                                {copiedId === logKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400">N/A</span>
                          )}

                          {log.metadata?.receiptHash && (
                            <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5" title={log.metadata.receiptHash}>
                              SHA: {log.metadata.receiptHash.substring(0, 12)}...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable JSON Metadata View */}
                    {isExpanded && log.metadata && (
                      <tr className="bg-slate-50/90 dark:bg-navy-900/90">
                        <td colSpan={5} className="p-4 px-6 border-y border-slate-200 dark:border-white/10">
                          <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto border border-white/10 max-h-48 leading-relaxed shadow-inner">
                            {JSON.stringify(log.metadata, null, 2)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </Card>
  );
}
