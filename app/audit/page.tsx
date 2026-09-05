'use client';

import React, { useEffect, useState } from 'react';
import { 
  History, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Filter 
} from 'lucide-react';
import AuditTimeline from '@/components/AuditTimeline';
import { AuditEvent } from '@/lib/types';

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const totalEvents = events.length;
  const approvedCount = events.filter(e => e.result === 'SUCCESS').length;
  const blockedCount = events.filter(e => e.result === 'BLOCKED').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Chronological Audit Trail
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Immutable Event Stream
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Complete transaction, negotiation, policy authorization, and adversarial threat timeline with structured facts and cryptographic receipt references.
          </p>
        </div>

        {/* Quick Stats & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg">
              {approvedCount} Approved
            </span>
            <span className="text-red-400 font-semibold px-2 py-1 bg-red-500/10 rounded-lg">
              {blockedCount} Blocked Threats
            </span>
          </div>

          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Audit Trail"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Render Audit Timeline Component */}
      <AuditTimeline events={events} />

    </div>
  );
}
