import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import ReceiptCard from '../components/receipt/ReceiptCard';
import api from '../services/api';

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReceipt() {
      try {
        const data = await api.getReceiptById(id);
        if (data.success) {
          setReceipt(data.receipt);
        } else {
          setError(data.message || 'Receipt not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load receipt.');
      } finally {
        setIsLoading(false);
      }
    }
    loadReceipt();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 font-body text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Verifying SHA-256 cryptographic seal &amp; fetching receipt data...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="max-w-md mx-auto p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 font-body">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-950">Receipt Verification</h3>
        <p className="text-xs text-rose-800">{error || 'Receipt ID not found.'}</p>
        <Link
          to="/receipts"
          className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold"
        >
          &larr; Back to Receipts Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground font-body">
      <div className="flex items-center space-x-2">
        <Link
          to="/receipts"
          className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Receipts</span>
        </Link>
      </div>

      <ReceiptCard receipt={receipt} />
    </div>
  );
}
