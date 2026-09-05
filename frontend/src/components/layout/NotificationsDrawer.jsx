import React from 'react';
import { 
  Bell, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  CreditCard, 
  Receipt, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsDrawer({ isOpen, onClose, events = [] }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const displayEvents = events.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-body animate-in fade-in duration-150">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-navy-800 border-l border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-navy-900/60">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Commerce &amp; Security Alerts
              </h3>
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {events.length}
              </span>
            </div>

            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Events Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayEvents.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                <p>No recent alerts logged.</p>
              </div>
            ) : (
              displayEvents.map((evt, idx) => {
                const isBlocked = evt.status === 'BLOCKED' || evt.decision === 'BLOCK' || evt.action === 'ATTACK_DETECTED' || evt.action === 'REQUEST_BLOCKED';
                const isSuccess = evt.status === 'SUCCESS' || evt.decision === 'ALLOW';

                return (
                  <div
                    key={evt.id || evt.eventId || idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                      isBlocked
                        ? 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-950 dark:text-rose-100'
                        : isSuccess
                        ? 'bg-slate-50 dark:bg-navy-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                        : 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-950 dark:text-amber-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isBlocked
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      }`}>
                        {evt.action || 'EVENT'}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>

                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {evt.reason || 'Telemetry event recorded.'}
                    </p>

                    {evt.sessionId && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                        Session: {evt.sessionId}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-navy-900/60 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                navigate('/audit');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <span>View Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white dark:bg-navy-700 hover:bg-slate-100 dark:hover:bg-navy-600 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
