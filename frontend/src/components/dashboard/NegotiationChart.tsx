import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export type TimeframeMode = 'live' | 'weekly' | 'monthly';

interface DataPoint {
  label: string;
  price: number;
  highlight?: boolean;
}

// 1. Monthly Dataset (10 points across 30 days)
const MONTHLY_DATA: DataPoint[] = [
  { label: 'Day 3', price: 2240 },
  { label: 'Day 6', price: 2310 },
  { label: 'Day 9', price: 2260 },
  { label: 'Day 12', price: 2380 },
  { label: 'Day 15', price: 2220 },
  { label: 'Day 18', price: 2420 },
  { label: 'Day 21', price: 2290 },
  { label: 'Day 24', price: 2350, highlight: true },
  { label: 'Day 27', price: 2460 },
  { label: 'Day 30', price: 2480 },
];

// 2. Weekly Dataset (7 points: Mon - Sun)
const WEEKLY_DATA: DataPoint[] = [
  { label: 'Mon', price: 2250 },
  { label: 'Tue', price: 2220 },
  { label: 'Wed', price: 2310 },
  { label: 'Thu', price: 2280 },
  { label: 'Fri', price: 2380, highlight: true },
  { label: 'Sat', price: 2240 },
  { label: 'Sun', price: 2300 },
];

// Initial Live Stream rolling buffer
const INITIAL_LIVE_DATA: DataPoint[] = [
  { label: 'Turn #1', price: 2210 },
  { label: 'Turn #2', price: 2260 },
  { label: 'Turn #3', price: 2340 },
  { label: 'Turn #4', price: 2280 },
  { label: 'Turn #5', price: 2390 },
  { label: 'Turn #6', price: 2310 },
  { label: 'Turn #7', price: 2350, highlight: true },
];

export const NegotiationChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeMode>('live');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [liveData, setLiveData] = useState<DataPoint[]>(INITIAL_LIVE_DATA);
  const [turnCounter, setTurnCounter] = useState(8);

  // Live Stream dynamic buffer update interval (every 2.5s)
  useEffect(() => {
    if (timeframe !== 'live') return;

    const interval = setInterval(() => {
      setTurnCounter(prevTurn => {
        const nextTurn = prevTurn + 1;
        // Generate new negotiated price strictly >= 2200 and <= 2420
        const randomStep = Math.floor(Math.random() * 20) * 10;
        const newPrice = 2200 + randomStep; // Between 2200 and 2390

        setLiveData(prevData => {
          const updated = [...prevData.slice(1)];
          // Clear highlight on previous items
          const cleaned = updated.map(p => ({ ...p, highlight: false }));
          cleaned.push({
            label: `Turn #${nextTurn}`,
            price: newPrice,
            highlight: true,
          });
          return cleaned;
        });

        return nextTurn;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [timeframe]);

  // Current active dataset
  const activeDataset = useMemo(() => {
    if (timeframe === 'monthly') return MONTHLY_DATA;
    if (timeframe === 'weekly') return WEEKLY_DATA;
    return liveData;
  }, [timeframe, liveData]);

  // Computed statistics
  const avgSettlement = useMemo(() => {
    if (!activeDataset.length) return 2280;
    const total = activeDataset.reduce((sum, d) => sum + d.price, 0);
    return Math.round(total / activeDataset.length);
  }, [activeDataset]);

  // Header Title
  const headerTitle = useMemo(() => {
    if (timeframe === 'monthly') return 'NEGOTIATION VALUE TRAJECTORY (LAST 30 DAYS)';
    if (timeframe === 'weekly') return 'NEGOTIATION VALUE TRAJECTORY (LAST 7 DAYS)';
    return 'NEGOTIATION VALUE TRAJECTORY (REAL-TIME STREAM)';
  }, [timeframe]);

  // SVG Chart Geometry calculations
  const width = 600;
  const height = 240;
  const minPrice = 2100;
  const maxPrice = 2520;
  const floorY = 175; // y coordinate corresponding to ₹2,200

  // Map price to Y coordinate
  const getY = (price: number) => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, price));
    const ratio = (clamped - minPrice) / (maxPrice - minPrice);
    return 205 - ratio * 155;
  };

  // Map index to X coordinate
  const getX = (index: number, count: number) => {
    if (count <= 1) return width / 2;
    const padding = 20;
    return padding + (index / (count - 1)) * (width - 2 * padding);
  };

  // Generate smooth spline SVG path
  const points = activeDataset.map((d, i) => ({
    x: getX(i, activeDataset.length),
    y: getY(d.price),
    ...d,
  }));

  const pathD = useMemo(() => {
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }, [points]);

  // Closed Area Path for gradient fill down to floor line
  const areaD = useMemo(() => {
    if (!pathD || !points.length) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    return `${pathD} L ${lastX} ${floorY} L ${firstX} ${floorY} Z`;
  }, [pathD, points, floorY]);

  // Find the active tooltip point (either marked highlight or the latest element)
  const highlightedPoint = useMemo(() => {
    const found = points.find(p => p.highlight);
    return found || points[points.length - 1];
  }, [points]);

  return (
    <div className="p-6 rounded-2xl bg-[#0B0F17]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden group">
      
      {/* 1. Header & Dropdown Toolbar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{headerTitle}</span>
              {timeframe === 'live' && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Dynamic settlement pricing vs. Hard Floor Enforcement
            </p>
          </div>

          {/* Timeframe Selector Dropdown */}
          <div className="relative self-start sm:self-auto z-30">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <span className="capitalize font-mono">
                {timeframe === 'live' ? 'Live Stream' : timeframe === 'weekly' ? 'Weekly' : 'Monthly'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#0B0F17]/95 border border-white/15 p-1.5 shadow-2xl z-40 text-xs backdrop-blur-xl">
                <button
                  onClick={() => { setTimeframe('monthly'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    timeframe === 'monthly' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span>Monthly</span>
                  <span className="text-[10px] text-zinc-500 font-mono">30D</span>
                </button>

                <button
                  onClick={() => { setTimeframe('weekly'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    timeframe === 'weekly' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span>Weekly</span>
                  <span className="text-[10px] text-zinc-500 font-mono">7D</span>
                </button>

                <button
                  onClick={() => { setTimeframe('live'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    timeframe === 'live' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Live Stream</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">LIVE</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Interactive Neon Chart Area */}
        <div className="relative mt-6 h-64 w-full select-none">
          
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Translucent Horizontal Grid lines */}
            {[45, 90, 135].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Merchant Hard Floor Limit Line (Fixed Purple Dashed Line at y = 2200) */}
            <line
              x1="0"
              y1={floorY}
              x2={width}
              y2={floorY}
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="drop-shadow-[0_0_8px_#a855f7]"
            />
            <text x="14" y={floorY - 8} fill="#c084fc" fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="0.05em">
              MERCHANT HARD FLOOR: ₹2,200 LIMIT
            </text>

            {/* Cyan Gradient Area Fill */}
            <path
              d={areaD}
              fill="url(#cyanAreaGradient)"
              className="transition-all duration-700 ease-out"
            />

            {/* Top Cyan Glowing Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={3}
              style={{ filter: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.6))' }}
              className="transition-all duration-700 ease-out"
            />

            {/* Interactive Data Points */}
            {points.map((pt, idx) => (
              <g key={idx} className="transition-all duration-700 ease-out">
                {pt.highlight && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    className="animate-ping origin-center opacity-75"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.highlight ? 5.5 : 4}
                  fill="#06b6d4"
                  className="shadow-md"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2"
                  fill="#ffffff"
                />
              </g>
            ))}
          </svg>

          {/* Dynamic Floating Tooltip */}
          {highlightedPoint && (
            <motion.div
              key={`${timeframe}-${highlightedPoint.label}-${highlightedPoint.price}`}
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                left: `${(highlightedPoint.x / width) * 100}%`,
                top: `${(highlightedPoint.y / height) * 100 - 18}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-full bg-[#0B0F17]/95 border border-cyan-500/50 px-3 py-1.5 rounded-xl shadow-[0_0_18px_rgba(34,211,238,0.45)] text-[11px] font-mono backdrop-blur-md pointer-events-none z-20 whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-zinc-400 font-medium">
                  {timeframe === 'monthly'
                    ? `${highlightedPoint?.label || 'Day'} • ₹${(highlightedPoint?.price ?? 2200).toLocaleString('en-IN')} Settled`
                    : timeframe === 'weekly'
                    ? `${highlightedPoint?.label || 'Day'} Peak • ₹${(highlightedPoint?.price ?? 2200).toLocaleString('en-IN')} Settled`
                    : `${highlightedPoint?.label || 'Turn'} • ₹${(highlightedPoint?.price ?? 2200).toLocaleString('en-IN')} Accepted`}
                </span>
              </div>
            </motion.div>
          )}

          {/* X-Axis Labels */}
          <div className="absolute bottom-1 inset-x-0 flex justify-between px-3 text-[10px] font-mono text-zinc-500 pointer-events-none">
            {(activeDataset || []).map((d, i) => (
              <span key={i} className="truncate max-w-[50px] text-center">
                {d?.label || ''}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Chart Footer Legend & Dynamic Average */}
      <div className="pt-4 mt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="text-zinc-300 font-medium">Settled Purchase Price</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="text-zinc-300 font-medium">Hard Floor (₹2,200)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-zinc-400">
            {timeframe === 'monthly' ? 'Monthly Avg:' : timeframe === 'weekly' ? 'Weekly Avg:' : 'Live Rolling Avg:'}
          </span>
          <span className="text-cyan-400 font-bold font-mono">
            ₹{(avgSettlement ?? 2280).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </div>
  );
};

export default NegotiationChart;
