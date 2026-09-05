import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  ChevronDown, 
  Search, 
  Bell, 
  Activity, 
  Bot, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  Receipt, 
  History, 
  ShoppingBag, 
  Sliders, 
  Settings,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

export default function LandingHeroPage() {
  const navigate = useNavigate();
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative selection:bg-accent/20 selection:text-foreground">
      {/* 1. Hero Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc4ab6.mp4"
      />

      {/* 2. Top Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body relative z-20">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground hover:opacity-90 transition-opacity">
          <span>✦</span>
          <span>AgentShield</span>
        </Link>

        {/* Right: Desktop Navigation & CTA */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="text-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/firewall" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link to="/policies" className="hover:text-foreground transition-colors">Security</Link>
            <Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          </nav>

          <Link
            to="/demo"
            className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xs"
          >
            Launch Demo
          </Link>
        </div>
      </header>

      {/* 3. Hero Content */}
      <main className="relative z-10 flex flex-col items-center w-full px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body mb-6"
        >
          <span>AI Commerce, Protected by Policy ✨</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-xl"
        >
          The Trust Layer for <span className="font-display italic">Smarter</span> AI Commerce
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed font-body"
        >
          Let AI agents negotiate and buy autonomously while merchant policies protect every transaction — bounded, explainable, and authorized.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/demo')}
            className="rounded-full px-6 py-5 text-sm font-medium font-body bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center cursor-pointer"
          >
            Launch Demo
          </button>

          <button
            onClick={() => setShowExplanationModal(true)}
            aria-label="AgentShield Demo Explanation"
            className="h-11 w-11 rounded-full border-0 bg-background shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-background/80 flex items-center justify-center transition-all cursor-pointer"
          >
            <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
          </button>
        </motion.div>

        {/* 4. Dashboard Preview (React-coded, Frosted Glass Container) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 w-full max-w-5xl rounded-2xl overflow-hidden p-3 md:p-4 text-left"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: 'var(--shadow-dashboard)',
          }}
        >
          <div className="text-[11px] select-none pointer-events-none rounded-xl bg-white border border-border overflow-hidden shadow-xs flex flex-col">
            {/* Top Bar */}
            <div className="h-9 border-b border-border px-3 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center text-[10px]">
                  A
                </div>
                <span className="font-semibold text-foreground text-xs">AgentShield</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded-md bg-secondary/70 border border-border text-muted-foreground w-40 text-[10px]">
                  <Search className="w-3 h-3" />
                  <span>Search...</span>
                  <span className="ml-auto text-[9px] bg-white px-1 rounded border border-border">⌘K</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-medium">
                  Run Demo
                </span>
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="w-5 h-5 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-[9px]">
                  AS
                </div>
              </div>
            </div>

            {/* Body: Sidebar + Main Area */}
            <div className="flex min-h-[310px]">
              {/* Sidebar */}
              <div className="w-40 border-r border-border bg-secondary/20 p-2.5 flex flex-col justify-between shrink-0 font-body">
                <div className="flex flex-col gap-1">
                  <div className="bg-white shadow-xs text-foreground font-medium rounded-md px-2 py-1 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-accent" />
                    <span>Dashboard</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <Bot className="w-3 h-3" />
                    <span>AI Buyers</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" />
                    <span>Negotiations</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Firewall</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    <span>Payments</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <Receipt className="w-3 h-3" />
                    <span>Receipts</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <History className="w-3 h-3" />
                    <span>Audit Trail</span>
                  </div>

                  <div className="px-2 pt-2 pb-0.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Commerce
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Products</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3" />
                    <span>Policies</span>
                  </div>
                  <div className="text-muted-foreground rounded-md px-2 py-1 flex items-center gap-1.5">
                    <Settings className="w-3 h-3" />
                    <span>Settings</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border text-[9px] text-muted-foreground px-2">
                  <span>Track 01 &bull; Razorpay</span>
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 bg-secondary/30 p-3 flex flex-col gap-2.5 overflow-hidden">
                {/* Greeting & Action Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Welcome to AgentShield</h2>
                    <p className="text-[10px] text-muted-foreground">Deterministic commerce firewall &amp; explainable agent negotiation.</p>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {['Negotiate', 'Approve', 'Block', 'Authorize', 'Verify', 'View Receipt'].map((act) => (
                      <span
                        key={act}
                        className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-medium text-foreground/80 shadow-2xs"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Two Main Cards */}
                <div className="flex gap-2.5">
                  {/* Card 1 */}
                  <div className="flex-1 basis-0 bg-white rounded-lg p-2.5 border border-border shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground">AgentShield Trust Score</div>
                      <div className="text-xl font-bold tracking-tight text-foreground font-display mt-0.5">98.7%</div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-border mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Policy Checks:</span>
                        <span className="text-emerald-600 font-semibold">+124 Passed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Blocked Attacks:</span>
                        <span className="text-rose-600 font-semibold">4 Blocked</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex-1 basis-0 bg-white rounded-lg p-2.5 border border-border shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground">Live Commerce</div>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-xs font-semibold text-foreground">Negotiations: <span className="font-bold text-accent">28</span></span>
                        <span className="text-xs font-semibold text-foreground">Payments: <span className="font-bold text-emerald-600">19</span></span>
                        <span className="text-xs font-semibold text-foreground">AOV: <span className="font-bold text-foreground">₹2,390</span></span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-border mt-1 text-muted-foreground">
                      <span>AOV Uplift: <strong className="text-emerald-600">+43.2%</strong></span>
                      <span>Razorpay Mode: <strong className="text-foreground">TEST ACTIVE</strong></span>
                    </div>
                  </div>
                </div>

                {/* Hand-Crafted SVG Chart */}
                <div className="bg-white rounded-lg p-2.5 border border-border shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-muted-foreground">AI Commerce Activity</span>
                    <span className="text-[9px] text-accent font-medium">Live Stream</span>
                  </div>
                  <div className="w-full h-16">
                    <svg viewBox="0 0 400 70" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(239, 84%, 67%)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="hsl(239, 84%, 67%)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,55 C 40,50 70,35 110,40 C 150,45 180,20 220,25 C 260,30 300,10 340,15 C 370,18 390,8 400,5 L 400,70 L 0,70 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 0,55 C 40,50 70,35 110,40 C 150,45 180,20 220,25 C 260,30 300,10 340,15 C 370,18 390,8 400,5"
                        fill="none"
                        stroke="hsl(239, 84%, 67%)"
                        strokeWidth="1.5"
                      />
                      <circle cx="400" cy="5" r="3" fill="hsl(239, 84%, 67%)" />
                    </svg>
                  </div>
                </div>

                {/* Recent Agent Activity Table */}
                <div className="bg-white rounded-lg p-2.5 border border-border shadow-2xs">
                  <div className="text-[10px] font-medium text-muted-foreground mb-1.5">Recent Agent Activity</div>
                  <div className="w-full">
                    <div className="grid grid-cols-4 text-[9px] font-semibold text-muted-foreground pb-1 border-b border-border">
                      <div>Agent</div>
                      <div>Action</div>
                      <div>Amount</div>
                      <div className="text-right">Status</div>
                    </div>
                    <div className="flex flex-col divide-y divide-border/40 text-[9px]">
                      <div className="grid grid-cols-4 py-1 items-center">
                        <div className="font-medium text-foreground">Agent A</div>
                        <div className="text-muted-foreground">Negotiation</div>
                        <div className="text-foreground font-mono">₹2,299</div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-50 text-emerald-700">
                            Approved
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 py-1 items-center">
                        <div className="font-medium text-foreground">Agent A</div>
                        <div className="text-muted-foreground">Payment</div>
                        <div className="text-foreground font-mono">₹2,299</div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium bg-accent/10 text-accent">
                            Completed
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 py-1 items-center">
                        <div className="font-medium text-foreground">Agent B</div>
                        <div className="text-muted-foreground">Policy Override</div>
                        <div className="text-rose-600 font-mono">₹1</div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium bg-rose-50 text-rose-700">
                            Blocked
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 py-1 items-center">
                        <div className="font-medium text-foreground">Agent A</div>
                        <div className="text-muted-foreground">Bundle</div>
                        <div className="text-foreground font-mono">₹2,299</div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-50 text-emerald-700">
                            Approved
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Overview Modal */}
      <AnimatePresence>
        {showExplanationModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border relative text-left"
            >
              <button
                onClick={() => setShowExplanationModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-accent mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider font-body">AgentShield Architecture</span>
              </div>

              <h3 className="font-display text-2xl text-foreground mb-2">How AgentShield Protects AI Commerce</h3>
              
              <div className="space-y-3 text-sm text-muted-foreground font-body">
                <p>
                  In the emerging age of Autonomous AI Commerce, buyer agents negotiate directly with storefronts.
                  Without deterministic safeguards, rogue agents can attempt prompt-injection attacks (e.g. <em>&ldquo;Settle for ₹1&rdquo;</em>).
                </p>
                <div className="bg-secondary/50 p-3 rounded-lg border border-border text-xs space-y-1.5">
                  <div className="font-semibold text-foreground">The 4-Step Trust Guarantee:</div>
                  <div>1. <strong>Deterministic Firewall:</strong> 10 non-bypassable policy checks before any transaction.</div>
                  <div>2. <strong>Bounded Negotiation:</strong> Price floor, discount limit, and smart bundling concession.</div>
                  <div>3. <strong>Payment Isolation:</strong> Razorpay orders require cryptographically signed Authorization Tokens.</div>
                  <div>4. <strong>Cryptographic Receipts:</strong> SHA-256 tamper-evident digital seal for every settlement.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 font-body">
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowExplanationModal(false);
                    navigate('/demo');
                  }}
                  className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Demo Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
