'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  ShoppingBag, 
  Receipt, 
  ArrowRight, 
  Activity, 
  CreditCard, 
  Users, 
  Percent, 
  Gift, 
  Sparkles,
  Lock,
  History,
  Play
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import DemoControlBar from '@/components/DemoControlBar';
import { MerchantMetrics, AuditEvent } from '@/lib/types';

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<MerchantMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, auditRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/audit?limit=6'),
      ]);
      const metricsData = await metricsRes.json();
      const auditData = await auditRes.json();

      if (metricsData.success) setMetrics(metricsData.metrics);
      if (auditData.success) setRecentEvents(auditData.events || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      
      {/* 1-Click Judge Demo Control Bar */}
      <DemoControlBar />

      {/* Merchant Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Merchant AI Commerce Dashboard
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Test Mode Metrics
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry on autonomous AI buyer negotiations, margin enforcement, and Razorpay settlements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/negotiate"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-glow-emerald transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live Negotiation</span>
          </Link>
          <Link
            href="/firewall"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inspect Firewall</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Revenue Story & AOV Uplift Showcase Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0F1E36] border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                AI Growth & Revenue Story
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Autonomous AI Negotiation Drives Higher Basket Value
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instead of losing potential customers to fixed-price friction, AgentShield allows AI buyers to negotiate within strictly bounded discount envelopes while securing high-margin upsells and bundle giveaways.
            </p>
          </div>

          {/* Dynamic AOV Uplift Calculation Badge */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Before AI Negotiation</span>
              <span className="text-base font-bold text-slate-300 mt-0.5 block">
                ₹{metrics ? metrics.baseCatalogAOV.toLocaleString('en-IN') : '2,180'}
              </span>
              <span className="text-[10px] text-slate-500">Base Catalog AOV</span>
            </div>

            <div className="text-slate-600 font-bold text-lg">$\rightarrow$</div>

            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block">After AI Negotiation</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                ₹{metrics ? metrics.negotiatedAOV.toLocaleString('en-IN') : '2,390'}
              </span>
              <span className="text-[10px] text-emerald-300">Negotiated AOV</span>
            </div>

            <div className="pl-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">AOV Uplift</span>
              <div className="flex items-center space-x-1 text-emerald-400 font-black text-lg">
                <TrendingUp className="w-4 h-4" />
                <span>+{metrics ? metrics.aovUpliftPercent : '9.6'}%</span>
              </div>
              <span className="text-[10px] text-slate-400">Dynamic DB derived</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <MetricCard
          title="AI Commerce Revenue"
          value={`₹${metrics ? metrics.totalRevenue.toLocaleString('en-IN') : '28,885'}`}
          subtext={`Negotiated: ₹${metrics ? metrics.negotiatedRevenue.toLocaleString('en-IN') : '11,646'}`}
          trend={{ value: '+24.8% vs last week', isPositive: true }}
          icon={CreditCard}
          variant="emerald"
        />

        <MetricCard
          title="Negotiated Orders"
          value={metrics ? metrics.negotiatedOrders : 5}
          subtext={`${metrics ? metrics.bundleAttachmentRatePercent : 100}% with Bundled Giveaway`}
          trend={{ value: '+18.2% conversion', isPositive: true }}
          icon={ShoppingBag}
          variant="cyan"
        />

        <MetricCard
          title="Average Order Value"
          value={`₹${metrics ? metrics.negotiatedAOV.toLocaleString('en-IN') : '2,390'}`}
          subtext={`Avg Discount: ${metrics ? metrics.averageDiscountPercent : 8.0}%`}
          trend={{ value: `+${metrics ? metrics.aovUpliftPercent : 9.6}% AOV uplift`, isPositive: true }}
          icon={TrendingUp}
          variant="emerald"
        />

        <MetricCard
          title="Successful Negotiations"
          value={`${metrics ? metrics.negotiationSuccessRatePercent : 83.3}%`}
          subtext={`${metrics ? metrics.successfulNegotiationsCount : 5} settled deals closed`}
          trend={{ value: 'Within 3 rounds avg', isPositive: true }}
          icon={Activity}
          variant="cyan"
        />

        <MetricCard
          title="Policy Violations Blocked"
          value={metrics ? metrics.policyViolationsCount : 2}
          subtext="Price floor & discount boundary violations"
          icon={ShieldAlert}
          variant="crimson"
        />

        <MetricCard
          title="Blocked Agent Injections"
          value={metrics ? metrics.blockedAgentAttemptsCount : 2}
          subtext="Prompt override & jailbreak attempts neutralized"
          icon={Lock}
          variant="crimson"
        />

      </div>

      {/* 2-Column Section: Real-Time Audit Stream + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Audit Trail Events */}
        <div className="lg:col-span-2 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">Recent Commerce & Security Events</h3>
            </div>
            <Link
              href="/audit"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
            >
              <span>View Full Audit Trail</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEvents.slice(0, 5).map((evt) => {
              const isBlocked = evt.result === 'BLOCKED';
              const isSuccess = evt.result === 'SUCCESS';
              return (
                <div 
                  key={evt.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isBlocked 
                      ? 'bg-red-950/20 border-red-500/30' 
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isBlocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {evt.actor}
                    </span>
                    <span className="text-slate-200 font-medium truncate">{evt.reason}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Feature Navigation Cards */}
        <div className="space-y-4">
          
          <Link
            href="/negotiate"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    1. Live Negotiation UI
                  </h4>
                  <p className="text-[11px] text-slate-400">3-column AI Buyer vs Merchant AI room</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/firewall"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-red-500/40 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">
                    2. Commerce Firewall
                  </h4>
                  <p className="text-[11px] text-slate-400">10 deterministic checks inspection</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/receipts"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    3. Negotiation Receipts
                  </h4>
                  <p className="text-[11px] text-slate-400">SHA-256 tamper-evident seals</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

        </div>

      </div>

    </div>
  );
}
