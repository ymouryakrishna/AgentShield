import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Code, 
  Gift, 
  Sliders, 
  ArrowRight, 
  ExternalLink,
  Tag,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [aiCatalogJson, setAiCatalogJson] = useState(null);
  const [activeTab, setActiveTab] = useState('human'); // 'human' | 'ai'
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [prodRes, aiRes] = await Promise.all([
          api.getProducts().catch(() => ({ success: false })),
          api.getAICatalog().catch(() => null),
        ]);
        if (prodRes.success) setProducts(prodRes.products || []);
        if (aiRes) setAiCatalogJson(aiRes);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load catalog.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const copyAICatalog = () => {
    if (aiCatalogJson) {
      navigator.clipboard.writeText(JSON.stringify(aiCatalogJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading merchant product catalog &amp; AI-readable JSON schema..." />;
  }

  if (error && products.length === 0) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Merchant Catalog &amp; AI Discovery
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              {products.length} Products Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Browse human-readable products and the canonical machine-readable AI catalog exposed at <code className="text-accent font-mono">/api/catalog/ai</code>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-secondary/70 p-1 rounded-full border border-border">
          <button
            onClick={() => setActiveTab('human')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'human'
                ? 'bg-white text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Human View</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>AI JSON View</span>
          </button>
        </div>
      </div>

      {activeTab === 'ai' ? (
        /* AI View */
        <div className="bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-accent" />
              <span className="font-bold text-foreground uppercase tracking-wider">
                GET /api/catalog/ai &bull; Machine-Readable Format
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={copyAICatalog}
                className="flex items-center space-x-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-full text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>

              <Link
                to="/catalog/ai"
                className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <span>Dedicated Endpoint View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <pre className="p-4 bg-secondary/50 rounded-xl border border-border text-xs font-mono text-foreground overflow-x-auto max-h-[600px] leading-relaxed">
            {JSON.stringify(aiCatalogJson, null, 2)}
          </pre>
        </div>
      ) : (
        /* Human View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const listPrice = p.price || p.listPrice || 2499;
            const floorPrice = p.negotiation?.floorPrice || p.floorPrice || 2200;
            const maxDiscount = p.negotiation?.maxDiscountPercent || p.maxDiscountPercent || 12;
            const maxRounds = p.negotiation?.maxRounds || p.maxNegotiationRounds || 3;
            const bundle = p.bundle || p.bundleRules;

            return (
              <div
                key={p.id}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between hover:border-foreground/30 transition-all group"
              >
                <div>
                  <div className="relative h-44 w-full bg-secondary/40 overflow-hidden">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-foreground font-semibold uppercase border border-border">
                      {p.category || 'Athletics'}
                    </div>
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                      ₹{Number(listPrice).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground tracking-tight font-display">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>

                    {/* Negotiation Envelope Details */}
                    <div className="p-3.5 bg-secondary/50 border border-border/80 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">Merchant Floor Price</span>
                        <span className="font-bold text-emerald-700 font-mono">₹{floorPrice.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">Max Permitted Discount</span>
                        <span className="font-bold text-accent font-mono">{maxDiscount}%</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">Negotiation Round Limit</span>
                        <span className="font-bold text-foreground">{maxRounds} Rounds</span>
                      </div>
                    </div>

                    {bundle && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                        <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate text-[11px]">
                          Free <strong>{bundle.freeGift || bundle.gift || 'Sports Socks'}</strong> on &gt;= ₹{bundle.minimumPrice || bundle.thresholdPrice || 2299}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => navigate(`/negotiations?product=${p.id}`)}
                    className="w-full py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-full text-xs transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Simulate AI Negotiation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
