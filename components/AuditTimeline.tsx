'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Code,
  CreditCard,
  MessageSquare,
  Gift,
  KeyRound
} from 'lucide-react';
import { AuditEvent, AuditAction } from '@/lib/types';

interface AuditTimelineProps {
  events: AuditEvent[];
}

const ACTION_ICONS: Partial<Record<AuditAction, React.ElementType>> = {
  BUYER_AGENT_CONNECTED: KeyRound,
  PRODUCT_SELECTED: MessageSquare,
  NEGOTIATION_STARTED: MessageSquare,
  BUYER_OFFER_PROPOSED: MessageSquare,
  COUNTER_OFFER: MessageSquare,
  BUNDLE_GRANTED: Gift,
  BUYER_CONFIRMED: CheckCircle2,
  POLICY_APPROVED: ShieldCheck,
  POLICY_OVERRIDE_ATTEMPT: ShieldAlert,
  REQUEST_BLOCKED: XCircle,
  RAZORPAY_ORDER_CREATED: CreditCard,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_FAILED: XCircle,
  NEGOTIATION_RECEIPT_CREATED: ShieldCheck,
  ADVERSARIAL_AGENT_REQUEST: AlertTriangle,
};

export default function AuditTimeline({ events }: AuditTimelineProps) {
  const [selectedActor, setSelectedActor] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const actors = ['ALL', 'AGENT_A_LEGITIMATE', 'AGENT_B_ADVERSARIAL', 'FIREWALL', 'POLICY_ENGINE', 'PAYMENT_SERVICE', 'MERCHANT', 'CUSTOMER'];
  const results = ['ALL', 'SUCCESS', 'BLOCKED', 'WARNING', 'INFO'];

  const filteredEvents = events.filter(e => {
    if (selectedActor !== 'ALL' && e.actor !== selectedActor) return false;
    if (selectedResult !== 'ALL' && e.result !== selectedResult) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchReason = e.reason.toLowerCase().includes(q);
      const matchAction = e.action.toLowerCase().includes(q);
      const matchActor = e.actor.toLowerCase().includes(q);
      const matchId = e.id.toLowerCase().includes(q);
      if (!matchReason && !matchAction && !matchActor && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Controls */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail (e.g. override, ₹2,299, blocked, order)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Actor and Result Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Result Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {results.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedResult(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedResult === r
                    ? r === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No audit events found matching the selected filters.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const Icon = ACTION_ICONS[evt.action] || Info;
            const isExpanded = expandedEventId === evt.id;
            const isBlocked = evt.result === 'BLOCKED';
            const isWarning = evt.result === 'WARNING';
            const isSuccess = evt.result === 'SUCCESS';

            return (
              <div 
                key={evt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isBlocked
                    ? 'bg-red-950/20 border-red-500/30'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Icon & Description */}
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isBlocked
                        ? 'bg-red-500/20 text-red-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : isSuccess
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isBlocked
                            ? 'bg-red-500/20 text-red-300'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {evt.action}
                        </span>

                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {evt.actor}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {evt.id}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-200 mt-1.5 leading-relaxed">
                        {evt.reason}
                      </p>

                      {/* Related IDs */}
                      {(evt.relatedOrderId || evt.relatedReceiptId || evt.relatedSessionId) && (
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono text-slate-400">
                          {evt.relatedOrderId && <span>Order: <strong className="text-slate-300">{evt.relatedOrderId}</strong></span>}
                          {evt.relatedReceiptId && <span>Receipt: <strong className="text-emerald-400">{evt.relatedReceiptId}</strong></span>}
                          {evt.relatedSessionId && <span>Session: <strong className="text-slate-300">{evt.relatedSessionId}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Timestamp & Details toggle */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {evt.metadata && (
                      <button
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className="mt-2 flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                      >
                        <Code className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide' : 'Metadata'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                </div>

                {/* Metadata Drawer */}
                {isExpanded && evt.metadata && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto">
                      {JSON.stringify(evt.metadata, null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
