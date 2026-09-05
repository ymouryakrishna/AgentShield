import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Gift, 
  Clock, 
  Scale, 
  Sliders, 
  Percent 
} from 'lucide-react';

export default function PolicyEnvelopeGauge({
  product,
  currentRound = 0,
  latestProposedPrice,
  isCompliant = true,
  overrideDetected = false
}) {
  if (!product) return null;

  const listedPrice = product.price || product.listPrice || 2499;
  const floorPrice = product.negotiation?.floorPrice || product.floorPrice || 2200;
  const maxDiscount = product.negotiation?.maxDiscountPercent || product.maxDiscountPercent || 12;
  const maxRounds = product.negotiation?.maxRounds || product.maxNegotiationRounds || 3;
  const bundle = product.bundle || product.bundleRules;

  const currentPrice = latestProposedPrice !== undefined ? latestProposedPrice : listedPrice;
  const discountAmount = Math.max(0, listedPrice - currentPrice);
  const currentDiscountPercent = (discountAmount / listedPrice) * 100;

  const isPriceAboveFloor = currentPrice >= floorPrice;
  const isDiscountWithinLimit = currentDiscountPercent <= maxDiscount + 0.05;
  const bundleThreshold = bundle?.minimumPrice || bundle?.thresholdPrice || 2299;
  const isBundleUnlocked = Boolean(bundle && currentPrice >= bundleThreshold);

  const priceRange = listedPrice - floorPrice;
  const priceMargin = currentPrice - floorPrice;
  const priceHealthPercent = Math.min(100, Math.max(0, (priceMargin / (priceRange || 1)) * 100));

  return (
    <div className="w-full bg-white border border-border rounded-2xl p-5 shadow-2xs relative overflow-hidden text-foreground font-body">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">Merchant Policy Envelope</h3>
        </div>
        
        {/* Compliance Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
          isCompliant && !overrideDetected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
        }`}>
          {isCompliant && !overrideDetected ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>POLICY COMPLIANT</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>{overrideDetected ? 'OVERRIDE BLOCKED' : 'POLICY BREACH'}</span>
            </>
          )}
        </div>
      </div>

      {/* Metric Visualizers */}
      <div className="mt-4 space-y-4">

        {/* 1. Price Floor Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Price Boundary vs Floor</span>
            </span>
            <div className="text-right">
              <span className="text-muted-foreground font-medium">Floor: ₹{floorPrice.toLocaleString('en-IN')}</span>
              <span className="text-border mx-1.5">|</span>
              <span className="text-foreground font-bold font-mono">Offer: ₹{Number(currentPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border flex">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isPriceAboveFloor ? 'bg-emerald-500' : 'bg-rose-500 w-full'
              }`}
              style={{ width: `${isPriceAboveFloor ? Math.max(15, priceHealthPercent) : 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="text-rose-600 font-medium">Hard Floor: ₹{floorPrice.toLocaleString('en-IN')}</span>
            <span className="text-foreground">Listed: ₹{listedPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 2. Discount Limit & Rounds Meter */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          
          <div className="p-3 bg-secondary/50 border border-border/80 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center space-x-1">
                <Percent className="w-3 h-3 text-accent" />
                <span>Discount</span>
              </span>
              <span className={`text-[11px] font-bold ${isDiscountWithinLimit ? 'text-accent' : 'text-rose-600'}`}>
                {currentDiscountPercent.toFixed(1)}% / {maxDiscount}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isDiscountWithinLimit ? 'bg-accent' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (currentDiscountPercent / (maxDiscount || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-secondary/50 border border-border/80 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Rounds</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                {currentRound} / {maxRounds}
              </span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex gap-0.5">
              {Array.from({ length: maxRounds }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-full flex-1 rounded-sm transition-colors ${
                    idx < currentRound ? 'bg-emerald-500' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* 3. Bundle Giveaway Eligibility */}
        {bundle && (
          <div className={`p-3 rounded-xl border transition-all ${
            isBundleUnlocked 
              ? 'bg-emerald-50/80 border-emerald-200' 
              : 'bg-secondary/40 border-border opacity-85'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className={`w-4 h-4 ${isBundleUnlocked ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-xs font-semibold text-foreground">{bundle.freeGift || bundle.gift || 'Sports Socks'}</p>
                  <p className="text-[10px] text-muted-foreground">Threshold: &gt;= ₹{bundleThreshold.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isBundleUnlocked
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-secondary text-muted-foreground border-border'
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
