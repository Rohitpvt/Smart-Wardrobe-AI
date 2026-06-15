import { useCallback } from "react";
import axios from "axios";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export function useApiError(context: string = "API") {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let message = customMessage || "An unexpected error occurred.";
    let details = null;

    if (axios.isAxiosError(error) && error.response) {
      // Extract detail from FastAPI standard response
      details = error.response.data?.detail;
      if (typeof details === "string") {
        message = details;
      } else if (details && typeof details === "object" && details.message) {
        message = details.message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    logger.error(`[${context}] ${message}`, { error, details });
    
    // Notify the user
    toast.error(message);
    
    return { message, details };
  }, [context]);

  return { handleError };
}
