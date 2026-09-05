import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs font-body animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className={`relative w-full ${maxWidth} bg-white border border-border rounded-2xl shadow-dashboard overflow-hidden z-10 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150`}>
        
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-base font-bold text-foreground font-display text-lg tracking-tight">
            {title}
          </h3>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {children}
        </div>

      </div>
    </div>
  );
}
