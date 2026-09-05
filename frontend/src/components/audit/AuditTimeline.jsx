import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Code,
  CreditCard,
  MessageSquare,
  Gift,
  KeyRound
} from 'lucide-react';

const ACTION_ICONS = {
  AGENT_REQUEST: KeyRound,
  BUYER_CONNECTED: KeyRound,
  OFFER_CREATED: MessageSquare,
  COUNTER_OFFER: MessageSquare,
  SETTLEMENT: CheckCircle2,
  CONSENT_RECEIVED: ShieldCheck,
  PAYMENT_AUTHORIZED: ShieldCheck,
  PAYMENT_CREATED: CreditCard,
  PAYMENT_VERIFIED: CreditCard,
  PAYMENT_SUCCESS: CreditCard,
  RECEIPT_CREATED: ShieldCheck,
  ATTACK_DETECTED: AlertTriangle,
  REQUEST_BLOCKED: ShieldAlert,
  POLICY_BLOCKED: ShieldAlert,
};

export default function AuditTimeline({ events = [], isLoading = false }) {
  const [selectedResult, setSelectedResult] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);

  const results = ['ALL', 'SUCCESS', 'BLOCKED', 'WARNING'];

  const filteredEvents = events.filter(e => {
    const status = e.status || e.result || 'INFO';
    if (selectedResult !== 'ALL' && status !== selectedResult && !(selectedResult === 'BLOCKED' && e.decision === 'BLOCK')) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchReason = (e.reason || '').toLowerCase().includes(q);
      const matchAction = (e.action || '').toLowerCase().includes(q);
      const matchActor = (e.actor || e.agentId || '').toLowerCase().includes(q);
      const matchId = (e.eventId || e.id || '').toLowerCase().includes(q);
      if (!matchReason && !matchAction && !matchActor && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-body text-foreground">
      
      {/* Search & Filter Controls */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail (e.g. override, ₹2,299, blocked, order)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Result Filter */}
        <div className="flex items-center space-x-1 bg-secondary/70 p-1 rounded-full border border-border self-start md:self-center">
          {results.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedResult(r)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                selectedResult === r
                  ? r === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs font-semibold' : 'bg-white text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {isLoading && events.length === 0 ? (
          <div className="p-12 text-center bg-white border border-border rounded-2xl text-muted-foreground text-xs shadow-2xs flex flex-col items-center justify-center space-y-2">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span>Loading chronological audit trail...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white border border-border rounded-2xl text-muted-foreground text-xs shadow-2xs">
            No audit events found matching the selected filters.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const Icon = ACTION_ICONS[evt.action] || Info;
            const eventKey = evt.eventId || evt.id || Math.random().toString();
            const isExpanded = expandedEventId === eventKey;
            const isBlocked = evt.status === 'BLOCKED' || evt.decision === 'BLOCK' || evt.action === 'ATTACK_DETECTED' || evt.action === 'REQUEST_BLOCKED';
            const isWarning = evt.status === 'WARNING';
            const isSuccess = evt.status === 'SUCCESS' || evt.decision === 'ALLOW' || evt.decision === 'SETTLE';

            return (
              <div 
                key={eventKey}
                className={`p-4 rounded-xl border transition-all ${
                  isBlocked
                    ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                    : isWarning
                    ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                    : 'bg-white border-border hover:border-foreground/30 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isBlocked
                        ? 'bg-rose-100 text-rose-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : isSuccess
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isBlocked
                            ? 'bg-rose-100 text-rose-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {evt.action}
                        </span>

                        <span className="text-[10px] font-mono bg-secondary text-foreground px-1.5 py-0.5 rounded border border-border font-semibold">
                          {evt.actor || evt.agentId || 'SYSTEM'}
                        </span>

                        <span className="text-[10px] text-muted-foreground font-mono">
                          {evt.eventId || evt.id}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-foreground mt-1.5 leading-relaxed">
                        {evt.reason}
                      </p>

                      {(evt.sessionId || evt.relatedOrderId || evt.relatedReceiptId) && (
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono text-muted-foreground">
                          {evt.sessionId && <span>Session: <strong className="text-foreground">{evt.sessionId}</strong></span>}
                          {evt.relatedOrderId && <span>Order: <strong className="text-foreground">{evt.relatedOrderId}</strong></span>}
                          {evt.relatedReceiptId && <span>Receipt: <strong className="text-emerald-700">{evt.relatedReceiptId}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}</span>
                    </div>

                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <button
                        onClick={() => setExpandedEventId(isExpanded ? null : eventKey)}
                        className="mt-2 flex items-center space-x-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Code className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide' : 'Metadata'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                </div>

                {isExpanded && evt.metadata && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <pre className="p-2.5 rounded-lg bg-secondary/80 border border-border text-[10px] font-mono text-foreground overflow-x-auto">
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
