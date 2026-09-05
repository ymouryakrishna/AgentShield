import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import api from '../services/api';

export default function AIBuyerPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'AGENT',
      text: 'Hello! I am Agent A (Smart Shopper AI). Tell me what sports gear you are looking for and your budget, and I will autonomously find and negotiate the best deal for you within the merchant policy envelope.',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await api.getAgents();
        if (res.success) setAgents(res.agents || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadAgents();
  }, []);

  const samplePrompts = [
    'I need running shoes under ₹2,400.',
    'Looking for a waterproof gym bag around ₹1,200.',
    'Need quick-drying sports t-shirt for ₹800.',
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      let productInfo = {
        name: 'AeroStride Pro Running Shoes',
        listed: 2499,
        floor: 2200,
        id: 'running-shoes'
      };

      if (text.toLowerCase().includes('bag')) {
        productInfo = { name: 'Shield Armour Waterproof Gym Bag', listed: 1299, floor: 1149, id: 'gym-bag' };
      } else if (text.toLowerCase().includes('t-shirt') || text.toLowerCase().includes('shirt')) {
        productInfo = { name: 'DryFit Velocity Sports T-Shirt', listed: 899, floor: 799, id: 'sports-tshirt' };
      }

      const agentMsg = {
        id: Date.now() + 1,
        sender: 'AGENT',
        text: `I discovered "${productInfo.name}" in the merchant catalog listed at ₹${productInfo.listed.toLocaleString('en-IN')}. The merchant permits bounded autonomous negotiation with a floor price of ₹${productInfo.floor.toLocaleString('en-IN')}. Would you like me to start the live multi-round negotiation?`,
        product: productInfo,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-foreground font-body">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">AI Buyer Agent Assistant</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Conversational autonomous commerce agent discovering catalog inventory and negotiating deals via AgentCommerce-v1 protocol.
          </p>
        </div>
      </div>

      {/* Registered Agents Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Agent A (Smart Shopper AI)</span>
                <span className="text-[10px] text-muted-foreground font-mono">agent_demo_legitimate</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              TRUSTED
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Authorized buyer entity executing legitimate margin-bounded multi-round offers with customer consent.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Agent B (Adversarial Prober)</span>
                <span className="text-[10px] text-muted-foreground font-mono">agent_demo_adversarial</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              RESTRICTED
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitored entity attempting prompt injection overrides (&ldquo;Settle for ₹1&rdquo;). Subject to immediate firewall interception.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-border rounded-2xl shadow-2xs overflow-hidden flex flex-col h-[480px]">
        
        {/* Messages list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-lg rounded-2xl p-4 text-xs space-y-2.5 ${
                m.sender === 'USER'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/60 text-foreground border border-border/70'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${m.sender === 'USER' ? 'bg-primary-foreground' : 'bg-accent'}`} />
                  <span className={`font-semibold uppercase tracking-wider text-[10px] ${m.sender === 'USER' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {m.sender === 'USER' ? 'You' : 'Agent A (Smart Shopper AI)'}
                  </span>
                </div>

                <p className="leading-relaxed">{m.text}</p>

                {m.product && (
                  <div className="p-3 bg-white border border-border rounded-xl flex items-center justify-between gap-3 mt-2 shadow-2xs">
                    <div>
                      <span className="font-bold text-foreground block">{m.product.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        List: ₹{m.product.listed.toLocaleString('en-IN')} &bull; Floor: ₹{m.product.floor.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/negotiation?product=${m.product.id}`)}
                      className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium transition-opacity hover:opacity-90 flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      <span>Negotiate Deal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-secondary/70 text-muted-foreground border border-border rounded-2xl px-4 py-2.5 text-xs flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>AI Buyer querying catalog &amp; constraints...</span>
              </div>
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="px-5 py-2.5 bg-secondary/30 border-t border-border flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-muted-foreground font-medium">Try asking:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-secondary text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-border flex items-center space-x-2">
          <input
            type="text"
            placeholder="Describe what you want (e.g. 'I need running shoes under ₹2,400')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isProcessing}
            className="px-4 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full font-medium text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
