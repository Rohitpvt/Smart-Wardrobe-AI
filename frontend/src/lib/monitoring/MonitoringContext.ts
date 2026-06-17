export interface MonitoringContext {
  widget?: string;
  route?: string;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}
