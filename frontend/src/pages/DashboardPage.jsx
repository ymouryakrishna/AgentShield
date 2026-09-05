import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  ShoppingBag, 
  Receipt, 
  ArrowRight, 
  Activity, 
  CreditCard, 
  Lock, 
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import RevenueStoryCard from '../components/dashboard/RevenueStoryCard';
import DemoControlBar from '../components/common/DemoControlBar';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [metricsData, auditData] = await Promise.all([
        api.getMetrics().catch(() => ({ success: false })),
        api.getAuditEvents({ limit: 8 }).catch(() => ({ success: false })),
      ]);

      if (metricsData.success) {
        setMetrics(metricsData.metrics);
        setError(null);
      } else {
        setError('Unable to reach AgentShield backend API.');
      }

      if (auditData.success) {
        setRecentEvents(auditData.events || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to connect to AgentShield backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading live telemetry &amp; autonomous commerce metrics..." />;
  }

  if (error && !metrics) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* 1-Click Judge Demo Control Bar */}
      <DemoControlBar />

      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight font-display">
              Good afternoon
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-body">
            Here&apos;s what is happening across your AI commerce. AI negotiates. Policy decides. Razorpay executes.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/negotiations"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-primary hover:opacity-90 text-primary-foreground text-xs font-medium transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Negotiation Room</span>
          </Link>
          <Link
            to="/firewall"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium border border-border transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Inspect Firewall</span>
          </Link>
        </div>
      </div>

      {/* Revenue Story & Dynamic AOV Uplift */}
      <RevenueStoryCard metrics={metrics} />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <MetricCard
          title="Total Revenue"
          value={`₹${metrics ? Number(metrics.totalRevenue || 0).toLocaleString('en-IN') : '0'}`}
          subtext={`Negotiated: ₹${metrics ? Number(metrics.negotiatedRevenue || 0).toLocaleString('en-IN') : '0'}`}
          trend={{ value: `+${metrics ? metrics.aovUplift : 0}% uplift`, isPositive: true }}
          icon={CreditCard}
          variant="emerald"
        />

        <MetricCard
          title="Negotiated Orders"
          value={metrics ? metrics.negotiatedOrders : 0}
          subtext={`${metrics ? metrics.bundleAttachmentRate : 100}% Bundle Attachment`}
          trend={{ value: '100% consent verified', isPositive: true }}
          icon={ShoppingBag}
          variant="cyan"
        />

        <MetricCard
          title="Average Order Value"
          value={`₹${metrics ? Number(metrics.negotiatedAOV || 0).toLocaleString('en-IN') : '0'}`}
          subtext={`Baseline: ₹${metrics ? Number(metrics.baselineAOV || 0).toLocaleString('en-IN') : '0'}`}
          trend={{ value: `+${metrics ? metrics.aovUplift : 0}% vs baseline`, isPositive: true }}
          icon={TrendingUp}
          variant="emerald"
        />

        <MetricCard
          title="Conversion Rate"
          value={`${metrics ? metrics.conversionRate : 0}%`}
          subtext="Settlement rate vs attempts"
          trend={{ value: 'Within 3 rounds max', isPositive: true }}
          icon={Activity}
          variant="cyan"
        />

        <MetricCard
          title="AOV Uplift"
          value={`+${metrics ? metrics.aovUplift : 0}%`}
          subtext="Margin preserved via bundle concession"
          trend={{ value: 'Positive margin uplift', isPositive: true }}
          icon={TrendingUp}
          variant="emerald"
        />

        <MetricCard
          title="Blocked Attempts"
          value={metrics ? metrics.blockedAttacks : 0}
          subtext="Prompt injection &amp; jailbreaks blocked"
          icon={Lock}
          variant="crimson"
        />

        <MetricCard
          title="Policy Violations"
          value={metrics ? metrics.policyViolations : 0}
          subtext="Floor breaches &amp; max round overruns"
          icon={ShieldAlert}
          variant="crimson"
        />

        <MetricCard
          title="Successful Agent Txns"
          value={metrics ? metrics.negotiatedOrders : 0}
          subtext="Sealed with SHA-256 integrity hash"
          icon={Receipt}
          variant="emerald"
        />

      </div>

      {/* 2-Column Section: Audit Activity Stream & Quick Access Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Live Activity Stream */}
        <div className="lg:col-span-2 p-5 bg-white border border-border rounded-2xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-body">
                Live Activity Telemetry
              </h3>
            </div>
            <Link
              to="/audit"
              className="text-xs text-accent hover:opacity-80 flex items-center space-x-1 font-medium"
            >
              <span>View Full Audit Trail</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent activity logged yet. Launch a demo flow above to stream live events.
              </div>
            ) : (
              recentEvents.slice(0, 6).map((evt) => {
                const isBlocked = evt.status === 'BLOCKED' || evt.decision === 'BLOCK' || evt.action === 'ATTACK_DETECTED';
                return (
                  <div 
                    key={evt.id || evt.eventId || Math.random()}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isBlocked 
                        ? 'bg-rose-50/70 border-rose-200' 
                        : 'bg-secondary/40 border-border/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {isBlocked ? (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-mono text-[10px] text-foreground bg-white px-1.5 py-0.5 rounded border border-border/60 font-semibold">
                        {evt.actor || evt.agentId || 'SYSTEM'}
                      </span>
                      <span className="text-foreground font-medium truncate font-body">{evt.reason}</span>
                    </div>

                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Access Navigation Cards */}
        <div className="space-y-3.5">
          
          <Link
            to="/negotiations"
            className="p-4 rounded-2xl bg-white border border-border hover:border-foreground/30 transition-all block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-accent transition-colors font-body">
                    1. Live Negotiation Engine
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Multi-turn AI negotiation room</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            to="/firewall"
            className="p-4 rounded-2xl bg-white border border-border hover:border-foreground/30 transition-all block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-rose-600 transition-colors font-body">
                    2. Commerce Firewall
                  </h4>
                  <p className="text-[11px] text-muted-foreground">10 deterministic checks &amp; test harness</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            to="/receipts"
            className="p-4 rounded-2xl bg-white border border-border hover:border-foreground/30 transition-all block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors font-body">
                    3. Negotiation Receipts
                  </h4>
                  <p className="text-[11px] text-muted-foreground">SHA-256 tamper-evident integrity seals</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            to="/catalog"
            className="p-4 rounded-2xl bg-white border border-border hover:border-foreground/30 transition-all block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-secondary text-foreground">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-accent transition-colors font-body">
                    4. AI-Readable Catalog
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Machine-readable JSON schema for agents</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

        </div>

      </div>

    </div>
  );
}
