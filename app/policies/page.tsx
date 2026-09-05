'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Lock, 
  Save, 
  CheckCircle2, 
  Scale, 
  Percent, 
  Clock, 
  Gift, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SEED_PRODUCTS } from '@/lib/catalog';
import { Product } from '@/lib/types';

export default function MerchantPoliciesPage() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(SEED_PRODUCTS[0]);
  const [floorPrice, setFloorPrice] = useState<number>(selectedProduct.negotiation.floorPrice);
  const [maxDiscount, setMaxDiscount] = useState<number>(selectedProduct.negotiation.maxDiscountPercent);
  const [maxRounds, setMaxRounds] = useState<number>(selectedProduct.negotiation.maxRounds);
  const [bundleMinPrice, setBundleMinPrice] = useState<number>(selectedProduct.bundle?.minimumPrice || 2299);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleProductSelect = (p: Product) => {
    setSelectedProduct(p);
    setFloorPrice(p.negotiation.floorPrice);
    setMaxDiscount(p.negotiation.maxDiscountPercent);
    setMaxRounds(p.negotiation.maxRounds);
    setBundleMinPrice(p.bundle?.minimumPrice || p.price);
    setIsSaved(false);
  };

  const handleSavePolicy = () => {
    selectedProduct.negotiation.floorPrice = floorPrice;
    selectedProduct.negotiation.maxDiscountPercent = maxDiscount;
    selectedProduct.negotiation.maxRounds = maxRounds;
    if (selectedProduct.bundle) {
      selectedProduct.bundle.minimumPrice = bundleMinPrice;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Merchant Policy Studio
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Deterministic Boundary Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Define strict financial envelopes, price floors, and bundle thresholds. The AI negotiates only within these mathematical boundaries.
          </p>
        </div>

        <button
          onClick={handleSavePolicy}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-glow-emerald self-start md:self-center"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Policy Saved & Enforced ✓' : 'Save & Enforce Policy'}</span>
        </button>
      </div>

      {/* Global Safety Guardrails Bar */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Prompt Injection Guard</span>
            <span className="text-[11px] text-emerald-400 font-mono">STRICT_DETERMINISTIC</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Customer Consent Gate</span>
            <span className="text-[11px] text-emerald-400 font-mono">MANDATORY_BEFORE_PAYMENT</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Order Value Ceiling</span>
            <span className="text-[11px] text-slate-300 font-mono">Max ₹1,00,000 / Order</span>
          </div>
        </div>
      </div>

      {/* Product Selection & Policy Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Product Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
            Select Product to Configure
          </span>
          <div className="space-y-2">
            {products.map((p) => {
              const isSelected = p.id === selectedProduct.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProductSelect(p)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <span className="text-[11px] text-slate-400">Listed: ₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Floor: ₹{p.negotiation.floorPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Policy Envelope Editor Form (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{selectedProduct.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Listed Price: <strong className="text-white">₹{selectedProduct.price.toLocaleString('en-IN')}</strong>
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono">
              ID: {selectedProduct.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* 1. Floor Price Control */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Hard Price Floor (₹ INR)</span>
                <span className="text-emerald-400 font-mono font-bold">₹{floorPrice.toLocaleString('en-IN')}</span>
              </label>
              <input
                type="range"
                min={Math.round(selectedProduct.price * 0.7)}
                max={selectedProduct.price}
                step={50}
                value={floorPrice}
                onChange={(e) => setFloorPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <p className="text-[10px] text-slate-400">
                The minimum price the autonomous AI agent is permitted to settle at.
              </p>
            </div>

            {/* 2. Maximum Discount Percentage */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Max Discount Percentage</span>
                <span className="text-cyan-400 font-mono font-bold">{maxDiscount}%</span>
              </label>
              <input
                type="range"
                min={5}
                max={25}
                step={0.5}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400">
                Hard ceiling on concession percentage allowed per negotiation session.
              </p>
            </div>

            {/* 3. Max Negotiation Rounds */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Max Negotiation Rounds</span>
                <span className="text-white font-mono font-bold">{maxRounds} Rounds</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={maxRounds}
                onChange={(e) => setMaxRounds(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <p className="text-[10px] text-slate-400">
                Caps back-and-forth turns to prevent unbounded agent polling loops.
              </p>
            </div>

            {/* 4. Bundle Giveaway Threshold */}
            {selectedProduct.bundle && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Bundle Threshold ({selectedProduct.bundle.freeGift})</span>
                  <span className="text-emerald-300 font-mono font-bold">$\ge$ ₹{bundleMinPrice.toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min={floorPrice}
                  max={selectedProduct.price}
                  step={50}
                  value={bundleMinPrice}
                  onChange={(e) => setBundleMinPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <p className="text-[10px] text-slate-400">
                  Minimum agreed price required to unlock complimentary bundle gift.
                </p>
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Changes take effect immediately across all active AI buyer sessions.
            </span>

            <button
              onClick={handleSavePolicy}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-glow-emerald"
            >
              Apply Policy
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
