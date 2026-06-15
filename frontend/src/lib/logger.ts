/**
 * Centralized logger abstraction for Smart Wardrobe AI.
 * Handles environment-aware logging and provides an interface for 
 * future integration with Sentry, Datadog, etc.
 */

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    if (!isProduction) {
      console.log(`[INFO]: ${message}`, context || "");
    }
    // TODO: Send to external monitoring in production
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (!isProduction) {
      console.warn(`[WARN]: ${message}`, context || "");
    }
    // TODO: Send to external monitoring in production
  },
  error: (error: Error | string | unknown, context?: Record<string, unknown>) => {
    if (!isProduction) {
      console.error(`[ERROR]:`, error, context || "");
    }
    // TODO: Send to external monitoring (e.g., Sentry) in production
  },
};
