"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { monitoring } from "@/lib/monitoring";
import { WidgetFallback } from "./WidgetFallback";
import { v4 as uuidv4 } from "uuid";

interface Props {
  children: ReactNode;
  widgetName: string;
  route?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const correlationId = uuidv4();
    monitoring.captureError(error, {
      widget: this.props.widgetName,
      route: this.props.route || "unknown",
      correlationId,
      metadata: { errorInfo },
    });
  }

  private resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      return <WidgetFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}
