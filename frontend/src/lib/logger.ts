/**
 * Centralized logger abstraction for Smart Wardrobe AI.
 * Handles environment-aware logging and provides an interface for 
 * future integration with Sentry, Datadog, etc.
 */

import { monitoring } from "./monitoring";

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    monitoring.captureMessage(message, "info", { metadata: context });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    monitoring.captureMessage(message, "warning", { metadata: context });
  },
  error: (error: Error | string | unknown, context?: Record<string, unknown>) => {
    if (error instanceof Error) {
      monitoring.captureError(error, { metadata: context });
    } else {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      monitoring.captureMessage(errorMessage, "error", { metadata: context });
    }
  },
};
