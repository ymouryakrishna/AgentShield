import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = 'No items found', 
  description = 'No records exist matching your query or filter criteria.',
  action = null 
}) {
  return (
    <div className="py-16 px-4 text-center bg-white border border-border rounded-2xl shadow-2xs font-body max-w-md mx-auto my-6 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-secondary/80 text-muted-foreground flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
