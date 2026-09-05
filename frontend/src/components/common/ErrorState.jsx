import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  title = 'Unable to Reach AgentShield Backend', 
  message = 'Please ensure the backend server is running on port 5000.',
  onRetry = null 
}) {
  return (
    <div className="py-12 px-6 text-center bg-rose-50/70 border border-rose-200 rounded-2xl shadow-2xs font-body max-w-md mx-auto my-6 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-950">{title}</h3>
      <p className="text-xs text-rose-800 leading-relaxed">{message}</p>
      
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-medium transition-opacity cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}
    </div>
  );
}
