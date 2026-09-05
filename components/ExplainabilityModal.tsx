'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Code, 
  Sparkles,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DecisionFacts } from '@/lib/types';
import { formatBulletPointsExplanation } from '@/lib/explainability';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facts: DecisionFacts | null;
  title?: string;
}

export default function ExplainabilityModal({
  isOpen,
  onClose,
  facts,
  title
}: ExplainabilityModalProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !facts) return null;

  const isApproved = facts.decision === 'APPROVE' || facts.decision === 'SETTLE';
  const isBlocked = facts.decision === 'BLOCK';
  const bulletPoints = formatBulletPointsExplanation(facts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isApproved 
            ? 'bg-emerald-950/30 border-emerald-500/20' 
            : isBlocked 
            ? 'bg-red-950/30 border-red-500/20' 
            : 'bg-blue-950/30 border-blue-500/20'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isApproved 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : isBlocked 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {isApproved ? (
                <ShieldCheck className="w-6 h-6" />
              ) : isBlocked ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <HelpCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {title || (isApproved ? 'Why was this approved?' : isBlocked ? 'Why was this blocked?' : 'Decision Policy Evaluation')}
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic structured explanation derived by AgentShield Policy Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Natural Language Explanation Box */}
          <div className={`p-4 rounded-xl border ${
            isApproved 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' 
              : isBlocked 
              ? 'bg-red-500/10 border-red-500/30 text-red-100' 
              : 'bg-slate-800/60 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-start space-x-2.5">
              <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
                isApproved ? 'text-emerald-400' : isBlocked ? 'text-red-400' : 'text-blue-400'
              }`} />
              <div>
                <p className="text-xs uppercase font-semibold tracking-wider opacity-75 mb-1">
                  Plain-English Factual Explanation
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {isApproved
                    ? `Approved because ₹${facts.proposedPrice.toLocaleString('en-IN')} is above the merchant's ₹${facts.floorPrice.toLocaleString('en-IN')} floor, the ${facts.discountPercent.toFixed(1)}% discount is within the allowed ${facts.maxDiscountPercent.toFixed(1)}% limit, the negotiation remained within ${facts.round} of ${facts.maxRounds} allowed rounds${facts.giftGranted ? `, and the order qualified for complimentary bundle gift (${facts.giftGranted})` : ''}.`
                    : isBlocked
                    ? `Blocked because ${facts.overrideDetected ? `a policy override attempt was detected` : ''}${facts.overrideDetected && facts.proposedPrice < facts.floorPrice ? ' and ' : ''}${facts.proposedPrice < facts.floorPrice ? `requested price ₹${facts.proposedPrice.toLocaleString('en-IN')} is below the merchant floor of ₹${facts.floorPrice.toLocaleString('en-IN')}` : ''}${facts.discountPercent > facts.maxDiscountPercent ? `, discount of ${facts.discountPercent.toFixed(1)}% exceeds maximum allowed ${facts.maxDiscountPercent.toFixed(1)}%` : ''}.`
                    : `Counteroffer generated within bounded policy envelope.`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Proposed Price</span>
              <p className="text-base font-bold text-white mt-0.5">₹{facts.proposedPrice.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-slate-500">Listed: ₹{facts.listedPrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Merchant Floor</span>
              <p className="text-base font-bold text-slate-200 mt-0.5">₹{facts.floorPrice.toLocaleString('en-IN')}</p>
              <span className={`text-[10px] ${facts.proposedPrice >= facts.floorPrice ? 'text-emerald-400' : 'text-red-400 font-semibold'}`}>
                {facts.proposedPrice >= facts.floorPrice ? '✓ Above Floor' : '✗ Below Floor!'}
              </span>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Discount Offered</span>
              <p className="text-base font-bold text-white mt-0.5">{facts.discountPercent.toFixed(1)}%</p>
              <span className="text-[10px] text-slate-500">Max Limit: {facts.maxDiscountPercent.toFixed(1)}%</span>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Round Progress</span>
              <p className="text-base font-bold text-white mt-0.5">Round {facts.round} / {facts.maxRounds}</p>
              <span className="text-[10px] text-emerald-400">Within Limit</span>
            </div>
          </div>

          {/* Deterministic Policy Checks Breakdown */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
              Policy Matrix Evaluation
            </h4>
            <div className="space-y-2">
              {bulletPoints.map((point, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start space-x-3 p-3 rounded-lg border text-xs ${
                    point.passed 
                      ? 'bg-slate-800/30 border-slate-700/50 text-slate-200' 
                      : 'bg-red-950/20 border-red-500/30 text-red-200 font-medium'
                  }`}
                >
                  {point.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Structured Facts Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Structured Decision Facts JSON' : 'View Structured Decision Facts JSON'}</span>
            </button>

            {showRawJson && (
              <pre className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(facts, null, 2)}
              </pre>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Timestamp: {new Date(facts.timestamp).toLocaleTimeString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
