"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("React Component Render Error", { 
      error, 
      errorInfo,
      context: this.props.context || "ErrorBoundary" 
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px] w-full">
          <GlassPanel className="max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="text-slate-400 text-sm">
              We encountered an unexpected error while loading this component.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </GlassPanel>
        </div>
      );
    }

    return this.props.children;
  }
}
