'use client';

import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Gift, 
  Clock, 
  Scale, 
  Sliders, 
  Percent, 
  AlertCircle 
} from 'lucide-react';
import { Product } from '@/lib/types';

interface PolicyEnvelopeGaugeProps {
  product: Product;
  currentRound: number;
  latestProposedPrice?: number;
  isCompliant: boolean;
  overrideDetected?: boolean;
}

export default function PolicyEnvelopeGauge({
  product,
  currentRound,
  latestProposedPrice,
  isCompliant,
  overrideDetected
}: PolicyEnvelopeGaugeProps) {
  const listedPrice = product.price;
  const floorPrice = product.negotiation.floorPrice;
  const maxDiscount = product.negotiation.maxDiscountPercent;
  const maxRounds = product.negotiation.maxRounds;
  const bundle = product.bundle;

  const currentPrice = latestProposedPrice || listedPrice;
  const discountAmount = Math.max(0, listedPrice - currentPrice);
  const currentDiscountPercent = (discountAmount / listedPrice) * 100;

  const isPriceAboveFloor = currentPrice >= floorPrice;
  const isDiscountWithinLimit = currentDiscountPercent <= maxDiscount + 0.05;
  const isRoundWithinLimit = currentRound <= maxRounds;
  const isBundleUnlocked = bundle && currentPrice >= bundle.minimumPrice;

  // Percentage progress from Floor to Listed
  const priceRange = listedPrice - floorPrice;
  const priceMargin = currentPrice - floorPrice;
  const priceHealthPercent = Math.min(100, Math.max(0, (priceMargin / (priceRange || 1)) * 100));

  return (
    <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-card-elevated relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
        isCompliant && !overrideDetected ? 'bg-emerald-500/10' : 'bg-red-500/15'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight uppercase">Merchant Policy Envelope</h3>
        </div>
        
        {/* Compliance Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
          isCompliant && !overrideDetected
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-red-500/15 text-red-300 border-red-500/30 animate-pulse'
        }`}>
          {isCompliant && !overrideDetected ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>POLICY COMPLIANT</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>{overrideDetected ? 'OVERRIDE BLOCKED' : 'POLICY BREACH'}</span>
            </>
          )}
        </div>
      </div>

      {/* Metric Visualizers */}
      <div className="mt-4 space-y-4 relative z-10">

        {/* 1. Price Floor Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Price Boundary vs Floor</span>
            </span>
            <div className="text-right">
              <span className="text-slate-300 font-medium">Floor: ₹{floorPrice.toLocaleString('en-IN')}</span>
              <span className="text-slate-500 mx-1.5">|</span>
              <span className="text-white font-bold">Offer: ₹{currentPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Price Bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 flex">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isPriceAboveFloor ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-red-500 w-full'
              }`}
              style={{ width: `${isPriceAboveFloor ? Math.max(15, priceHealthPercent) : 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400">
            <span className="text-red-400 font-medium">Hard Floor: ₹{floorPrice.toLocaleString('en-IN')}</span>
            <span className="text-slate-300">Listed: ₹{listedPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 2. Discount Limit & Rounds Meter */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          
          {/* Discount Meter */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center space-x-1">
                <Percent className="w-3 h-3 text-cyan-400" />
                <span>Discount</span>
              </span>
              <span className={`text-[11px] font-bold ${isDiscountWithinLimit ? 'text-cyan-300' : 'text-red-400'}`}>
                {currentDiscountPercent.toFixed(1)}% / {maxDiscount}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-700/60 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isDiscountWithinLimit ? 'bg-cyan-400' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(100, (currentDiscountPercent / (maxDiscount || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Rounds Meter */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Rounds</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-300">
                {currentRound} / {maxRounds}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-700/60 rounded-full overflow-hidden flex gap-0.5">
              {Array.from({ length: maxRounds }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-full flex-1 rounded-sm transition-colors ${
                    idx < currentRound ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* 3. Bundle Giveaway Eligibility Card */}
        {bundle && (
          <div className={`p-3 rounded-xl border transition-all ${
            isBundleUnlocked 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-slate-800/30 border-slate-700/50 opacity-75'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className={`w-4 h-4 ${isBundleUnlocked ? 'text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-white">{bundle.freeGift}</p>
                  <p className="text-[10px] text-slate-400">Unlocked at $\ge$ ₹{bundle.minimumPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isBundleUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isBundleUnlocked ? 'QUALIFIED ✓' : 'LOCKED'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
