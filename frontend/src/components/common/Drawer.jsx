import React from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children, width = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-body animate-in fade-in duration-150">
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen ${width} bg-white border-l border-border shadow-dashboard flex flex-col`}>
          
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground tracking-wide font-display text-base">
              {title}
            </h3>

            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
