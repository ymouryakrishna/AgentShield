import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Bot, 
  Store, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertTriangle,
  Gift,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Receipt
} from 'lucide-react';
import PolicyEnvelopeGauge from '../components/negotiation/PolicyEnvelopeGauge';
import ExplainabilityModal from '../components/common/ExplainabilityModal';
import RazorpayCheckoutModal from '../components/common/RazorpayCheckoutModal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function NegotiationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [product, setProduct] = useState(null);
  const [proposedPriceInput, setProposedPriceInput] = useState(2200);
  const [promptTextInput, setPromptTextInput] = useState('');
  const [customerConsent, setCustomerConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Payment State
  const [activeExplainFacts, setActiveExplainFacts] = useState(null);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [policyAuthorizationToken, setPolicyAuthorizationToken] = useState(null);
  const [latestOrderId, setLatestOrderId] = useState(null);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  const loadSession = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Session from backend
      const res = await api.getSession(id).catch(() => ({ success: false }));
      
      let currentSession = res.success ? res.session : null;

      // If session not found by id in in-memory store (e.g. freshly navigated), initialize or fetch default
      if (!currentSession) {
        const prodRes = await api.getProducts();
        const defaultProd = prodRes.products?.find(p => p.id === 'running-shoes') || prodRes.products?.[0];
        
        const initRes = await api.createNegotiation({
          productId: defaultProd?.id || 'running-shoes',
          buyerAgentId: 'agent_demo_legitimate',
          buyerAgentName: 'Agent A (Smart Shopper AI)',
        });

        if (initRes.success) {
          currentSession = initRes.session;
        }
      }

      if (currentSession) {
        setSession(currentSession);
        
        // Fetch product details
        const prodRes = await api.getProducts();
        const foundProd = prodRes.products?.find(p => p.id === currentSession.productId) || {
          id: currentSession.productId,
          name: currentSession.productName || 'Running Shoes',
          listPrice: currentSession.listPrice || 2499,
          floorPrice: currentSession.floorPrice || 2200,
          maxDiscountPercent: 12,
          maxNegotiationRounds: 3,
        };
        setProduct(foundProd);

        // Prepopulate input
        const lastOffer = currentSession.offers?.[currentSession.offers.length - 1];
        setProposedPriceInput(lastOffer ? lastOffer.proposedPrice : foundProd.floorPrice || 2200);
        setPromptTextInput(
          lastOffer 
            ? `Accepting deal at ₹${lastOffer.proposedPrice}.` 
            : `I want to purchase ${foundProd.name}. Can you offer ₹${foundProd.floorPrice || 2200}?`
        );
      } else {
        setError('Negotiation session not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load session details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const handleSendOffer = async (customPrice, customPrompt, intent = 'NEGOTIATE') => {
    if (!session) return;
    setIsProcessing(true);

    const price = customPrice !== undefined ? customPrice : Number(proposedPriceInput);
    const prompt = customPrompt !== undefined ? customPrompt : promptTextInput;

    try {
      const res = await api.submitOffer(session.sessionId || session.id || id, {
        proposedPrice: price,
        promptText: prompt,
        intent,
        customerConsent: intent === 'ACCEPT_OFFER' || intent === 'CHECKOUT' || customerConsent,
      });

      if (res.session) {
        setSession(res.session);
      }

      if (res.status === 'SETTLED' || intent === 'ACCEPT_OFFER') {
        handleAuthorizeSettlement(price);
      } else if (res.counterOffer) {
        setProposedPriceInput(res.counterOffer.proposedPrice);
        setPromptTextInput(`Accepting counteroffer of ₹${res.counterOffer.proposedPrice}.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit offer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthorizeSettlement = async (agreedPrice) => {
    if (!session) return;
    try {
      const res = await api.acceptOffer(session.sessionId || session.id || id, {
        finalPrice: agreedPrice || session.finalPrice || proposedPriceInput,
        customerConsent: true,
      });

      if (res.success) {
        setPolicyAuthorizationToken(res.policyAuthorizationToken);
        setSession(res.session);

        // Call backend payment order creation with cryptographic policy token
        const orderRes = await api.createPaymentOrder({
          sessionId: session.sessionId || session.id || id,
          amountInRupees: agreedPrice || session.finalPrice || proposedPriceInput,
          policyAuthorizationToken: res.policyAuthorizationToken,
        });

        if (orderRes.success) {
          setLatestOrderId(orderRes.order.orderId);
          setShowRazorpayModal(true);
        }
      }
    } catch (err) {
      alert(err.message || 'Settlement authorization failed.');
    }
  };

  const onPaymentCompleted = (paymentData) => {
    setShowRazorpayModal(false);
    setCreatedReceipt(paymentData.receipt);
  };

  const openExplainModal = (facts) => {
    setActiveExplainFacts(facts);
    setShowExplainModal(true);
  };

  if (isLoading) {
    return <LoadingState message="Loading negotiation session &amp; policy boundaries..." />;
  }

  if (error || !session) {
    return (
      <ErrorState 
        title="Session Not Found" 
        message={error || "The requested negotiation session does not exist."} 
        onRetry={loadSession} 
      />
    );
  }

  const offers = session.offers || [];
  const latestOffer = offers[offers.length - 1];
  const isBlocked = session.status === 'BLOCKED' || offers.some(o => o.decision === 'BLOCK');
  const isSettled = session.status === 'SETTLED';
  const overrideDetected = offers.some(o => o.signals?.includes('POLICY_OVERRIDE_ATTEMPT') || o.policyStatus === 'OVERRIDDEN');

  return (
    <div className="space-y-6 text-foreground font-body">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              to="/negotiations"
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">
              Negotiation Session: <span className="font-mono text-accent">{session.sessionId || id}</span>
            </h1>
            <StatusBadge status={session.status || 'ACTIVE'} size="xs" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Autonomous multi-turn negotiation bounded by deterministic merchant envelopes and monitored by CommerceFirewall.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/firewall"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-full text-xs font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Firewall Inspector</span>
          </Link>
          <button
            onClick={loadSession}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
            title="Refresh Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-COLUMN NEGOTIATION ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: AI BUYER AGENT (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-border rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          
          <div className="space-y-4">
            
            {/* Buyer Profile */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-body">
                    {session.buyerAgentName || 'Agent A (Smart Shopper AI)'}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ID: {session.agentId || 'agent_demo_legitimate'}
                  </span>
                </div>
              </div>

              <StatusBadge status={session.agentId === 'agent_demo_adversarial' ? 'RESTRICTED' : 'TRUSTED'} size="xs" />
            </div>

            {/* Target Item Details */}
            {product && (
              <div className="p-3.5 bg-secondary/50 border border-border rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">{product.name}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    List: ₹{Number(product.listPrice || product.price || 2499).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Floor: ₹{product.floorPrice || 2200}
                </span>
              </div>
            )}

            {/* Buyer Offer History */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Buyer Offer History:
              </span>

              {offers.map((off, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    off.decision === 'BLOCK' || off.policyStatus === 'VIOLATION'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-secondary/40 border-border text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Round {off.round || idx + 1}
                    </span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      ₹{Number(off.proposedPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-muted-foreground italic">&ldquo;{off.promptText || off.message}&rdquo;</p>
                </div>
              ))}

              {offers.length === 0 && (
                <div className="py-6 text-center text-muted-foreground text-xs">
                  No buyer offers submitted yet.
                </div>
              )}
            </div>

          </div>

          {/* Offer Proposal Controls */}
          {!isSettled && !isBlocked && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Proposed Offer Price (₹ INR)
                </label>
                <input
                  type="number"
                  value={proposedPriceInput}
                  onChange={(e) => setProposedPriceInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-sm font-mono font-bold text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Agent Proposal Message / Prompt
                </label>
                <textarea
                  rows={2}
                  value={promptTextInput}
                  onChange={(e) => setPromptTextInput(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendOffer(proposedPriceInput, promptTextInput, 'NEGOTIATE')}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full text-xs font-medium transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offer</span>
                </button>

                <button
                  onClick={() => handleSendOffer(proposedPriceInput, 'Deal. Accepting offer.', 'ACCEPT_OFFER')}
                  disabled={isProcessing}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-full text-xs font-medium transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Accept Deal</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* COLUMN 2: CENTER NEGOTIATION TIMELINE (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          <PolicyEnvelopeGauge
            product={product}
            currentRound={session.round || 0}
            latestProposedPrice={latestOffer ? latestOffer.proposedPrice : (product?.listPrice || 2499)}
            isCompliant={!isBlocked}
            overrideDetected={overrideDetected}
          />

          {/* Settlement / Threat Status Card */}
          {overrideDetected && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-2">
              <div className="flex items-center space-x-2 text-rose-700 font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Threat Signature Intercepted</span>
              </div>
              <p>
                The CommerceFirewall detected an explicit jailbreak pattern. The deterministic policy engine intercepted the request, protecting the merchant margin.
              </p>
            </div>
          )}

          {isSettled && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Negotiation Settled</span>
                </span>
                <span className="font-mono text-sm font-bold text-emerald-700">
                  ₹{Number(session.finalPrice || 2299).toLocaleString('en-IN')}
                </span>
              </div>

              <p>
                Settlement reached with customer consent. Bundle included: <strong>{session.bundle || 'Sports Socks'}</strong>.
              </p>

              {createdReceipt ? (
                <button
                  onClick={() => navigate(`/receipts/${createdReceipt.receiptId}`)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-full text-center block cursor-pointer transition-colors"
                >
                  View Cryptographic Receipt ({createdReceipt.receiptId})
                </button>
              ) : (
                <button
                  onClick={() => handleAuthorizeSettlement(session.finalPrice)}
                  className="w-full py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-full text-center flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Razorpay Test Payment</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* COLUMN 3: MERCHANT POLICY ENGINE & EXPLAINABILITY (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-border rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          
          <div className="space-y-4">
            
            {/* Merchant Agent Profile */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-body">
                    Merchant Policy Engine
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Deterministic Margin Guard</span>
                </div>
              </div>

              <StatusBadge status="ACTIVE" size="xs" />
            </div>

            {/* Merchant Decisions & Explainability */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {offers.map((off, idx) => {
                const isDecisionBlocked = off.decision === 'BLOCK' || off.policyStatus === 'VIOLATION';

                return (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      isDecisionBlocked
                        ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isDecisionBlocked ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        {isDecisionBlocked ? 'REQUEST BLOCKED 🚨' : `Merchant Round ${off.round || idx + 1} Decision`}
                      </span>

                      <span className="font-mono font-bold text-foreground text-sm">
                        ₹{Number(off.proposedPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="leading-relaxed">
                      {isDecisionBlocked 
                        ? (off.explanation || off.reason || 'Blocked because price was below the merchant floor and policy violation was detected.') 
                        : (off.message || 'Counteroffer generated within permitted margin envelope.')
                      }
                    </p>

                    {off.bundleOffered && (
                      <div className="p-2 bg-emerald-100/70 border border-emerald-200 rounded-lg flex items-center space-x-1.5 text-emerald-800 font-semibold text-[11px]">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Included Bundle: {off.bundleOffered}</span>
                      </div>
                    )}

                    {/* Explain Decision "Why?" Button */}
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => openExplainModal(off.policyFacts || {
                          decision: isDecisionBlocked ? 'BLOCK' : 'APPROVE',
                          proposedPrice: off.proposedPrice || proposedPriceInput,
                          floorPrice: product?.floorPrice || 2200,
                          discountPercent: 8.0,
                          maxDiscountPercent: 12.0,
                          round: off.round || 1,
                          maxRounds: 3,
                          giftGranted: off.bundleOffered || 'Sports Socks',
                          explanation: isDecisionBlocked 
                            ? 'Blocked because proposed price is below the merchant floor and policy override signature was detected.' 
                            : 'Approved because offer price remains above the floor price and within permitted discount bounds.'
                        })}
                        className="text-[11px] text-accent hover:opacity-80 flex items-center space-x-1 font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Why {isDecisionBlocked ? 'blocked' : 'approved'}?</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {offers.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  Awaiting buyer proposal to calculate policy concession curve.
                </div>
              )}
            </div>

          </div>

          {/* Customer Consent & Settlement Box */}
          {!isSettled && !isBlocked && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <label className="flex items-start space-x-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={customerConsent}
                  onChange={(e) => setCustomerConsent(e.target.checked)}
                  className="mt-0.5 rounded text-accent focus:ring-accent border-border"
                />
                <span className="text-foreground leading-snug">
                  I explicitly verify and authorize settlement for <strong className="font-mono">₹{proposedPriceInput}</strong> under merchant policy envelope.
                </span>
              </label>

              <button
                onClick={() => handleSendOffer(proposedPriceInput, 'Deal confirmed with customer consent.', 'ACCEPT_OFFER')}
                disabled={!customerConsent || isProcessing}
                className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-medium rounded-full text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm &amp; Proceed to Razorpay Payment</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Razorpay Test Mode Checkout Modal */}
      {product && (
        <RazorpayCheckoutModal
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
          orderId={latestOrderId || 'order_test_2026'}
          amountInRupees={session?.finalPrice || proposedPriceInput}
          productName={product.name}
          bundleAttached={session?.bundle || 'Sports Socks'}
          policyAuthorizationToken={policyAuthorizationToken || 'AUTH_TOKEN_POLICY_PASSED_DEMO'}
          sessionId={session?.sessionId || id}
          onSuccess={onPaymentCompleted}
        />
      )}

      {/* Decision Explainability Modal */}
      <ExplainabilityModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        facts={activeExplainFacts}
        title={activeExplainFacts?.decision === 'BLOCK' ? 'Why was this blocked?' : 'Why was this approved?'}
      />

    </div>
  );
}
