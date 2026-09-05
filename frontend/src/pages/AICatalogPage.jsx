import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Copy, 
  Check, 
  ArrowLeft, 
  Terminal, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import api from '../services/api';

export default function AICatalogPage() {
  const [aiCatalog, setAiCatalog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAICatalog = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAICatalog();
      setAiCatalog(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch AI-readable catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAICatalog();
  }, []);

  const curlCommand = `curl -X GET "http://localhost:5000/api/catalog/ai" -H "Accept: application/json"`;

  const copyJson = () => {
    if (aiCatalog) {
      navigator.clipboard.writeText(JSON.stringify(aiCatalog, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  if (isLoading) {
    return <LoadingState message="Fetching canonical AI-readable JSON catalog schema..." />;
  }

  if (error && !aiCatalog) {
    return <ErrorState message={error} onRetry={fetchAICatalog} />;
  }

  return (
    <div className="space-y-6 text-foreground font-body max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              to="/catalog"
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">
              AI-Readable Catalog Feed
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              AgentCommerce-v1
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Machine-readable canonical product feed exposed to autonomous buyer agents for catalog discovery and margin-bounded negotiation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyJson}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy Full Feed'}</span>
          </button>
        </div>
      </div>

      {/* Curl Command Box */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase text-[10px] tracking-wider">Direct API Curl Access</span>
          <button
            onClick={copyCurl}
            className="text-[11px] text-accent hover:opacity-80 flex items-center space-x-1 font-semibold cursor-pointer"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <div className="p-2.5 bg-secondary/60 rounded-xl border border-border font-mono text-xs text-foreground select-all">
          {curlCommand}
        </div>
      </div>

      {/* JSON Schema Viewer */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-accent" />
            <span className="font-mono text-foreground font-semibold">Response: application/json</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Status: 200 OK</span>
        </div>

        <pre className="p-4 bg-secondary/50 rounded-xl border border-border text-xs font-mono text-foreground overflow-x-auto max-h-[650px] leading-relaxed select-text">
          {JSON.stringify(aiCatalog, null, 2)}
        </pre>
      </div>

    </div>
  );
}
