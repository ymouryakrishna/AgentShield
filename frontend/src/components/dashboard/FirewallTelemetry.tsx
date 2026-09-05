import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Activity, Sparkles } from 'lucide-react';

interface FirewallTelemetryProps {
  isAttacking?: boolean;
}

interface HourlyBar {
  time: string;
  volume: number; // 0 to 100
  handshakes: number;
}

const DEFAULT_HOURLY_DATA: HourlyBar[] = [
  { time: '12:00', volume: 45, handshakes: 28 },
  { time: '12:30', volume: 65, handshakes: 41 },
  { time: '13:00', volume: 85, handshakes: 53 },
  { time: '13:30', volume: 50, handshakes: 32 },
  { time: '14:00', volume: 95, handshakes: 62 },
  { time: '14:30', volume: 75, handshakes: 48 },
  { time: '15:00', volume: 60, handshakes: 38 },
  { time: '15:30', volume: 90, handshakes: 58 },
  { time: '16:00', volume: 70, handshakes: 45 },
  { time: '16:30', volume: 85, handshakes: 54 },
  { time: '17:00', volume: 65, handshakes: 42 },
  { time: 'Now', volume: 78, handshakes: 50 },
];

export const FirewallTelemetry: React.FC<FirewallTelemetryProps> = ({ isAttacking = false }) => {
  const [hoveredBar, setHoveredBar] = useState<HourlyBar | null>(null);
  const [latency, setLatency] = useState<number>(24);
  const [hourlyData, setHourlyData] = useState<HourlyBar[]>(DEFAULT_HOURLY_DATA);

  // Dynamic Latency jitter between 18ms and 38ms
  useEffect(() => {
    const latencyInterval = setInterval(() => {
      const min = isAttacking ? 32 : 18;
      const max = isAttacking ? 38 : 28;
      setLatency(Math.floor(Math.random() * (max - min + 1)) + min);
    }, 1800);

    return () => clearInterval(latencyInterval);
  }, [isAttacking]);

  // React to adversarial attack spike
  useEffect(() => {
    if (isAttacking) {
      setHourlyData(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          time: 'Now',
          volume: 100,
          handshakes: 99,
        };
        return updated;
      });
    } else {
      setHourlyData(DEFAULT_HOURLY_DATA);
    }
  }, [isAttacking]);

  const xTicks = ['12:00', '13:00', '14:00', '15:00', '16:00', 'Now'];

  return (
    <div className="p-6 rounded-2xl bg-[#0B0F17]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-6 relative overflow-hidden group">
      
      {/* 1. Header */}
      <div>
        <div className="pb-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>FIREWALL ENGINE TELEMETRY</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${
                isAttacking 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                {isAttacking ? 'THREAT ACTIVE' : 'LIVE'}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daily agent handshakes & threat filtration
            </p>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Activity className={`w-4 h-4 ${isAttacking ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
          </div>
        </div>

        {/* 2. Hourly Request Volume Chart with Hover Tooltips & X-Axis */}
        <div className="mt-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase font-mono">
              Hourly Agent Requests
            </span>
            {hoveredBar && (
              <span className="text-[11px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {hoveredBar.time} — {hoveredBar.handshakes} Handshakes
              </span>
            )}
          </div>

          {/* Bar Chart Container */}
          <div className="h-20 flex items-end justify-between gap-1.5 p-2 bg-black/50 rounded-xl border border-white/5 relative">
            {hourlyData.map((bar, idx) => {
              const isLast = idx === hourlyData.length - 1;
              const isAttackingBar = isLast && isAttacking;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBar(bar)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 h-full flex items-end justify-center cursor-pointer group/bar relative"
                >
                  {/* Floating tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/90 border border-white/20 text-[9px] font-mono px-1.5 py-0.5 rounded text-white pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {bar.time}: {bar.handshakes}
                  </div>

                  {/* Neon Bar */}
                  <motion.div
                    layout
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.volume}%` }}
                    transition={{ duration: 0.4 }}
                    className={`w-full rounded-t-md transition-all ${
                      isAttackingBar
                        ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_12px_#f43f5e] animate-pulse'
                        : 'bg-gradient-to-t from-cyan-600 to-cyan-400 hover:brightness-125 shadow-[0_0_6px_rgba(6,182,212,0.3)]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom X-Axis Time Indicators */}
          <div className="flex justify-between px-2 pt-1.5 text-[9px] font-mono text-zinc-500 select-none">
            {xTicks.map((tick, i) => (
              <span key={i} className={tick === 'Now' && isAttacking ? 'text-rose-400 font-bold' : ''}>
                {tick}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Feature Consumption Progress Bars */}
        <div className="mt-5 space-y-3.5">
          
          {/* 1. Floor Price Checks */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-300">Floor Price Invariant Checks</span>
              <span className="text-cyan-400 font-mono">100% Enforced</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full shadow-[0_0_10px_#06b6d4]" 
                style={{ width: '100%' }} 
              />
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">0 Floor Leaks</div>
          </div>

          {/* 2. Discount Cap Bounds */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-300">Discount Cap Bounds (12%)</span>
              <span className="text-cyan-400 font-mono">8.4% Avg / 12% Max</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full shadow-[0_0_10px_#06b6d4]" 
                style={{ width: '70%' }} 
              />
            </div>
          </div>

          {/* 3. Prompt Injection Filters */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-300">Prompt Injection Filters</span>
              <span className="text-purple-400 font-mono">Active (Heuristic + Regex)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full shadow-[0_0_10px_#a855f7]" 
                style={{ width: '100%' }} 
              />
            </div>
          </div>

          {/* 4. SHA-256 Cryptographic Seals */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-300">SHA-256 Cryptographic Seals</span>
              <span className="text-emerald-400 font-mono">100% Sealed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full shadow-[0_0_10px_#10b981]" 
                style={{ width: '100%' }} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Footer Telemetry & Live Attack State Indicator */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span>Engine Latency: {latency}ms</span>
        <span className={`font-bold transition-colors ${
          isAttacking ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
        }`}>
          {isAttacking ? 'STATE: INTERCEPTING' : 'STATE: OPTIMAL'}
        </span>
      </div>

    </div>
  );
};

export default FirewallTelemetry;
