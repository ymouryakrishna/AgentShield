import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AgentShield — The Trust Layer for AI Commerce | Razorpay Buildathon',
  description: 'AI negotiates. Policy decides. Every transaction explains why. Bounded negotiation engine, deterministic firewall, and explainable receipts for Razorpay agentic commerce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070A12] py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-400">AgentShield</span>
              <span>—</span>
              <span>Razorpay Buildathon Track 01 (AI Growth & Agentic Commerce)</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-400 font-mono text-[11px]">Razorpay Test Mode Active</span>
              <span className="text-slate-600">|</span>
              <span>Deterministic Policy Engine v2026.1</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
