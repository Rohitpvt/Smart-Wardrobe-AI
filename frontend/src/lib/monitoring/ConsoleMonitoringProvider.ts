import { MonitoringProvider } from "./MonitoringProvider";
import { MonitoringContext } from "./MonitoringContext";
import { v4 as uuidv4 } from "uuid";

export class ConsoleMonitoringProvider implements MonitoringProvider {
  private _generateCorrelationId(): string {
    return uuidv4();
  }

  private _formatPayload(
    eventType: string,
    messageOrError: string,
    context?: MonitoringContext
  ): Record<string, unknown> {
    const timestamp = new Date().toISOString();
    const correlationId = context?.correlationId || this._generateCorrelationId();
    
    return {
      timestamp,
      correlationId,
      route: context?.route || "unknown",
      widget: context?.widget || "unknown",
      eventType,
      message: messageOrError,
      metadata: context?.metadata || {}
    };
  }

  public captureError(error: Error, context?: MonitoringContext): void {
    const payload = this._formatPayload("error", error.message, context);
    // Explicitly add stack trace for errors
    payload.stack = error.stack;
    
    console.error(JSON.stringify(payload));
  }

  public captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: MonitoringContext
  ): void {
    const payload = this._formatPayload(level, message, context);
    
    if (level === "error") {
      console.error(JSON.stringify(payload));
    } else if (level === "warning") {
      console.warn(JSON.stringify(payload));
    } else {
      console.info(JSON.stringify(payload));
    }
  }

  public startTransaction(name: string, metadata?: Record<string, unknown>): string {
    const transactionId = this._generateCorrelationId();
    const payload = this._formatPayload("transaction_start", `Starting transaction: ${name}`, {
      correlationId: transactionId,
      metadata
    });
    
    console.info(JSON.stringify(payload));
    return transactionId;
  }

  public finishTransaction(transactionId: string): void {
    const payload = this._formatPayload("transaction_end", `Ending transaction: ${transactionId}`, {
      correlationId: transactionId
    });
    
    console.info(JSON.stringify(payload));
  }
}
