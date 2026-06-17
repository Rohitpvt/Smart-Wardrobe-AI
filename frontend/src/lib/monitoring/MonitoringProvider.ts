import { MonitoringContext } from "./MonitoringContext";

export interface MonitoringProvider {
  captureError(
    error: Error,
    context?: MonitoringContext
  ): void;

  captureMessage(
    message: string,
    level?: "info" | "warning" | "error",
    context?: MonitoringContext
  ): void;

  startTransaction(
    name: string,
    metadata?: Record<string, unknown>
  ): string;

  finishTransaction(
    transactionId: string
  ): void;
}
