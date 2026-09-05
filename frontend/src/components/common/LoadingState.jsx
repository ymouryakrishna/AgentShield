import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Fetching data from AgentShield Trust Engine...' }) {
  return (
    <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 font-body text-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
