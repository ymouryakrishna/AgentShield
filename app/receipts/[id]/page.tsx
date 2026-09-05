'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  History,
  Sparkles
} from 'lucide-react';
import ReceiptCard from '@/components/ReceiptCard';
import { NegotiationReceipt } from '@/lib/types';

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;

  const [receipt, setReceipt] = useState<NegotiationReceipt | null>(null);
  const [integrityCheck, setIntegrityCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`/api/receipts/${receiptId}`);
        const data = await res.json();
        if (data.success) {
          setReceipt(data.receipt);
          setIntegrityCheck(data.integrityCheck);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (receiptId) fetchReceipt();
  }, [receiptId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Receipt Not Found</h2>
        <p className="text-xs text-slate-400">The requested receipt ID &quot;{receiptId}&quot; could not be located in the test store.</p>
        <Link
          href="/receipts"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Receipts Hub</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/receipts"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Receipts Hub</span>
        </Link>

        {integrityCheck && integrityCheck.isValid && (
          <div className="flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Integrity: 100% MATCH ✓</span>
          </div>
        )}
      </div>

      {/* Render Receipt Card */}
      <ReceiptCard receipt={receipt} />

    </div>
  );
}
