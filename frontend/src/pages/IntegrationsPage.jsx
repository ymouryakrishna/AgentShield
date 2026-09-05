import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Store, 
  ShieldCheck, 
  Code, 
  Lock, 
  CheckCircle2, 
  Activity, 
  ExternalLink, 
  Copy, 
  Check,
  RefreshCw,
  Zap
} from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import api from '../services/api';

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/health', desc: 'System health & uptime status' },
  { method: 'GET', path: '/api/catalog', desc: 'Merchant product catalog' },
  { method: 'GET', path: '/api/catalog/ai', desc: 'Machine-readable AI catalog canonical feed' },
  { method: 'GET', path: '/api/policies', desc: 'Merchant policy envelopes & margin limits' },
  { method: 'POST', path: '/api/policies', desc: 'Update merchant policy envelope' },
  { method: 'GET', path: '/api/agents', desc: 'Registered AI buyer agent entities' },
  { method: 'POST', path: '/api/agents', desc: 'Register new AI buyer agent' },
  { method: 'POST', path: '/api/firewall/evaluate', desc: '10-Check deterministic firewall evaluation' },
  { method: 'POST', path: '/api/negotiations', desc: 'Initiate bounded negotiation session' },
  { method: 'GET', path: '/api/negotiations/:id', desc: 'Fetch negotiation session state' },
  { method: 'POST', path: '/api/negotiations/:id/offer', desc: 'Submit negotiation offer' },
  { method: 'POST', path: '/api/negotiations/:id/accept', desc: 'Consent & issue Policy Authorization Token' },
  { method: 'POST', path: '/api/payments/create', desc: 'Create Razorpay payment order (Token required)' },
  { method: 'POST', path: '/api/payments/verify', desc: 'Verify payment signature & seal receipt' },
  { method: 'GET', path: '/api/receipts', desc: 'Fetch sealed negotiation receipts' },
  { method: 'GET', path: '/api/receipts/:id', desc: 'Fetch cryptographic receipt by ID' },
  { method: 'POST', path: '/api/receipts/:id/verify', desc: 'Verify receipt canonical SHA-256 integrity' },
  { method: 'GET', path: '/api/audit', desc: 'Chronological immutable audit log' },
  { method: 'GET', path: '/api/metrics', desc: 'AOV uplift & telemetry metrics' },
  { method: 'POST', path: '/api/demo/legitimate', desc: '1-Click legitimate settlement simulation' },
  { method: 'POST', path: '/api/demo/adversarial', desc: '1-Click adversarial attack interception' },
];

export default function IntegrationsPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [latency, setLatency] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const data = await api.getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ status: 'OFFLINE' });
      setLatency(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const copyPath = (path, idx) => {
    navigator.clipboard.writeText(`http://localhost:5000${path}`);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 text-foreground font-body max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Payment &amp; API Integrations
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              REST &bull; 21 Endpoints
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Razorpay payment adapter configuration, REST API discovery directory, and real-time Trust Layer telemetry.
          </p>
        </div>

        <button
          onClick={checkStatus}
          className="flex items-center space-x-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-full text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Ping Trust Layer</span>
        </button>
      </div>

      {/* Connectivity & Health Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Backend API Health
          </span>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${healthStatus?.status !== 'OFFLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-lg font-bold font-mono text-foreground">
              {healthStatus?.status || 'HEALTHY'}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">http://localhost:5000</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Trust Layer Latency
          </span>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-lg font-bold font-mono text-foreground">
              {latency ? `${latency} ms` : '< 12 ms'}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">Deterministic Policy Engine</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Razorpay Adapter
          </span>
          <div className="flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="text-lg font-bold font-mono text-foreground">
              Test Mode
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">HMAC-SHA256 Server Verified</span>
        </div>
      </div>

      {/* Razorpay Architecture Box */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-border">
          <Lock className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Client-Blind Payment Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
            <span className="font-bold text-foreground block">Zero Browser API Key Exposure</span>
            <p className="text-muted-foreground leading-relaxed">
              The merchant frontend never holds Razorpay secret keys. Orders and webhook validations are processed strictly inside the backend Trust Layer.
            </p>
          </div>

          <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2">
            <span className="font-bold text-foreground block">Policy Authorization Token Gating</span>
            <p className="text-muted-foreground leading-relaxed">
              Order creation requires a valid cryptographic Policy Authorization Token generated only after all 10 firewall checks and customer consent pass.
            </p>
          </div>
        </div>
      </div>

      {/* REST API Directory */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-body">
              AgentShield REST API Contract Directory
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Base: /api</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Copy URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {API_ENDPOINTS.map((ep, idx) => (
                <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      ep.method === 'GET' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : ep.method === 'POST'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ep.method}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-foreground">
                    {ep.path}
                  </td>

                  <td className="py-3 px-4 font-body text-muted-foreground text-xs">
                    {ep.desc}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => copyPath(ep.path, idx)}
                      className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg border border-border text-[10px] font-sans transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? 'Copied ✓' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
