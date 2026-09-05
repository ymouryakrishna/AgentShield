import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Lock, 
  ShieldCheck, 
  Save, 
  Check, 
  CreditCard, 
  Bell, 
  Key, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function AppSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Acme Sports Store',
    merchantId: 'merchant_acme_2026',
    contactEmail: 'admin@acmesports.io',
    currency: 'INR (₹)',
    testMode: true,
    requireConsent: true,
    strictFirewall: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 400);
  };

  return (
    <div className="space-y-6 text-foreground font-body max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-display">
              Application Settings
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              Merchant Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure merchant store identity, Trust Layer guardrails, and Razorpay test mode settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Settings Saved ✓</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Settings'}</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Merchant Store Identity */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <Store className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Merchant Store Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Merchant ID
              </label>
              <input
                type="text"
                disabled
                value={storeSettings.merchantId}
                className="w-full px-3 py-2 bg-secondary/80 border border-border rounded-xl text-xs text-muted-foreground font-mono"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Notification Email
              </label>
              <input
                type="email"
                value={storeSettings.contactEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Base Currency
              </label>
              <input
                type="text"
                disabled
                value={storeSettings.currency}
                className="w-full px-3 py-2 bg-secondary/80 border border-border rounded-xl text-xs text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Trust & Commerce Security Guardrails */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Trust Layer Security Guardrails
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-secondary/40 border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Mandatory Human Customer Consent</span>
                <span className="text-[11px] text-muted-foreground">Requires explicit customer verification before financial settlement</span>
              </div>
              <input
                type="checkbox"
                checked={storeSettings.requireConsent}
                onChange={(e) => setStoreSettings({ ...storeSettings, requireConsent: e.target.checked })}
                className="rounded text-accent focus:ring-accent border-border"
              />
            </div>

            <div className="p-3.5 bg-secondary/40 border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Deterministic CommerceFirewall 10-Check Strict Mode</span>
                <span className="text-[11px] text-muted-foreground">Intercept all requests that violate hard price floors or prompt injection scans</span>
              </div>
              <input
                type="checkbox"
                checked={storeSettings.strictFirewall}
                onChange={(e) => setStoreSettings({ ...storeSettings, strictFirewall: e.target.checked })}
                className="rounded text-accent focus:ring-accent border-border"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Razorpay Test Mode Credentials Notice */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <CreditCard className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Razorpay Test Mode Integration
            </h3>
          </div>

          <div className="p-3.5 bg-secondary/40 border border-border rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Environment</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Razorpay Test Mode (Track 01)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Server-Side Signature Check</span>
              <span className="font-mono font-semibold text-foreground">HMAC-SHA256 Enforced</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Browser Secret Exposure</span>
              <span className="font-mono font-bold text-emerald-700">0% (Client Blind)</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
