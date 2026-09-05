'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Code, 
  Sparkles, 
  ExternalLink, 
  Gift, 
  Sliders, 
  Percent, 
  Scale, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { SEED_PRODUCTS, getAICatalogRepresentation } from '@/lib/catalog';

export default function CatalogPage() {
  const [showJsonSchema, setShowJsonSchema] = useState(false);
  const aiSchema = getAICatalogRepresentation();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              AI-Readable Product Catalog
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AgentCommerce-v1 Protocol
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Machine-readable catalog exposing deterministic negotiation envelopes, floor prices, and bundle rules to autonomous AI shopping agents.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/catalog/ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>Raw Endpoint (/api/catalog/ai)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setShowJsonSchema(!showJsonSchema)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-glow-emerald"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJsonSchema ? 'Show Human Catalog' : 'Show AI JSON Schema'}</span>
          </button>
        </div>
      </div>

      {/* Raw AI JSON Schema View */}
      {showJsonSchema ? (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-emerald-400 font-bold">X-Agent-Commerce-Protocol: AgentCommerce-v1</span>
            <span>Content-Type: application/json</span>
          </div>
          <pre className="p-4 bg-slate-900/60 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-[70vh] border border-slate-800">
            {JSON.stringify(aiSchema, null, 2)}
          </pre>
        </div>
      ) : (
        /* Human Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SEED_PRODUCTS.map((prod) => (
            <div 
              key={prod.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-card-elevated flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Product Image preview */}
                <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-slate-800">
                    {prod.category}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                    Negotiable: {prod.negotiable ? 'YES ✓' : 'NO'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{prod.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>
                  </div>

                  {/* Pricing and Floor Envelope */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Listed Price</span>
                      <span className="font-extrabold text-white text-sm">₹{prod.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Merchant Hard Floor</span>
                      <span className="font-bold text-emerald-400">₹{prod.negotiation.floorPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Max Discount Limit</span>
                      <span className="font-semibold text-cyan-400">{prod.negotiation.maxDiscountPercent}% (Max {prod.negotiation.maxRounds} Rounds)</span>
                    </div>
                  </div>

                  {/* Bundle Giveaway Criteria */}
                  {prod.bundle && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold block truncate">Bundle: {prod.bundle.freeGift}</span>
                        <span className="text-[10px] text-slate-400 block">
                          Threshold: $\ge$ ₹{prod.bundle.minimumPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <Link
                  href={`/negotiate`}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Test AI Negotiation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
