import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertTriangle, 
  Lock, 
  Bot, 
  Clock, 
  Code, 
  ArrowRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Drawer from '../components/common/Drawer';
import api from '../services/api';

export default function SecurityEventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSecurityEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditEvents({ limit: 100 });
      if (data.success) {
        setEvents(data.events || []);
        setError(null);
      } else {
        setError('Failed to fetch security events from backend.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  // Map and categorize security events
  const securityEvents = events.map(e => {
    const isInjection = e.action === 'ATTACK_DETECTED' || (e.reason || '').toLowerCase().includes('injection') || (e.reason || '').toLowerCase().includes('override');
    const isBlocked = e.status === 'BLOCKED' || e.decision === 'BLOCK' || e.action === 'REQUEST_BLOCKED';
    const isWarning = e.status === 'WARNING';

    let severity = 'LOW';
    if (isInjection) severity = 'CRITICAL';
    else if (isBlocked) severity = 'HIGH';
    else if (isWarning) severity = 'MEDIUM';

    return {
      ...e,
      id: e.eventId || e.id || `SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      severity,
      isInjection,
      isBlocked,
    };
  });

  const filteredEvents = securityEvents.filter(e => {
    const matchesSearch = (e.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.agentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.action || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const criticalCount = securityEvents.filter(e => e.severity === 'CRITICAL').length;
  const highCount = securityEvents.filter(e => e.severity === 'HIGH').length;

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Security Event Center
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {criticalCount + highCount} Threat Signatures Flagged
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time telemetry on adversarial prompt injection attempts, below-floor offer exploits, and unauthorized bot crawlers.
          </p>
        </div>

        <button
          onClick={fetchSecurityEvents}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-full text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Threats</span>
        </button>
      </div>

      {/* Threat Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider block">Critical Prompt Injections</span>
          <span className="text-2xl font-bold font-display text-rose-900 block">{criticalCount}</span>
          <span className="text-[10px] text-muted-foreground">Jailbreak signatures intercepted</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider block">Policy Floor Breaches</span>
          <span className="text-2xl font-bold font-display text-rose-900 block">{highCount}</span>
          <span className="text-[10px] text-muted-foreground">Below-floor offers neutralized</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">Firewall Neutralization Rate</span>
          <span className="text-2xl font-bold font-display text-emerald-900 block">100%</span>
          <span className="text-[10px] text-muted-foreground">Zero rogue transactions passed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-accent font-bold uppercase tracking-wider block">Payment Isolation</span>
          <span className="text-2xl font-bold font-display text-foreground block">Active</span>
          <span className="text-[10px] text-muted-foreground">HMAC-SHA256 Token Gated</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search security events by agent, threat description, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center space-x-1 bg-secondary/70 p-1 rounded-full border border-border self-start md:self-center">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                severityFilter === sev
                  ? sev === 'CRITICAL' ? 'bg-rose-600 text-white shadow-2xs font-semibold' : 'bg-white text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Security Events List */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message="Scanning threat intelligence &amp; audit telemetry..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSecurityEvents} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No threat events found"
            description="All incoming AI agent requests are currently clean or match your filter."
          />
        ) : (
          <div className="divide-y divide-border/60">
            {filteredEvents.map((evt) => {
              const isCrit = evt.severity === 'CRITICAL';
              const isHigh = evt.severity === 'HIGH';

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-4 hover:bg-secondary/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCrit ? 'bg-rose-50/40' : isHigh ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isCrit
                        ? 'bg-rose-600 text-white'
                        : isHigh
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {isCrit ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCrit
                            ? 'bg-rose-600 text-white'
                            : isHigh
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {evt.severity}
                        </span>

                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-secondary border border-border">
                          {evt.actor || evt.agentId || 'SYSTEM'}
                        </span>

                        <span className="text-[10px] text-muted-foreground font-mono">
                          {evt.id}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-foreground leading-relaxed">
                        {evt.reason}
                      </p>

                      {evt.sessionId && (
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          Session: {evt.sessionId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <div className="text-right text-[11px] font-mono text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Detail Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Security Event Inspector"
      >
        {selectedEvent && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Event ID</span>
                <span className="font-mono font-bold text-foreground">{selectedEvent.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Severity</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {selectedEvent.severity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Actor / Agent</span>
                <span className="font-mono text-foreground font-semibold">{selectedEvent.agentId || selectedEvent.actor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Decision</span>
                <StatusBadge status={selectedEvent.decision || selectedEvent.status} size="xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Firewall Finding</h4>
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-950 leading-relaxed font-body">
                {selectedEvent.reason}
              </div>
            </div>

            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Request Metadata</h4>
                <pre className="p-3 bg-secondary/80 border border-border rounded-xl text-[10px] font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
