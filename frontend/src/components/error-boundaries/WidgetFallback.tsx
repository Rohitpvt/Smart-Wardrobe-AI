import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface WidgetFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function WidgetFallback({ error, resetErrorBoundary }: WidgetFallbackProps) {
  return (
    <GlassPanel className="h-full w-full border-dashed border-gray-700/50 bg-gray-900/30 flex items-center justify-center p-6 text-center min-h-[150px]">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-gray-800/80 p-3 mb-2">
          <AlertTriangle className="h-5 w-5 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-300">Widget Unavailable</h3>
        <p className="text-xs text-gray-500 max-w-[200px] mb-2">
          This widget is temporarily unavailable. The rest of your dashboard is functioning normally.
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm bg-gray-800/50 border-gray-700 hover:bg-gray-800 text-xs h-8 px-3"
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          Retry
        </button>
      </div>
    </GlassPanel>
  );
}
