"use client";

import { useToast } from "@/hooks/useToast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md min-w-[300px] animate-in slide-in-from-bottom-5",
            {
              "bg-charcoal/90 border-cyber-cyan/30 text-porcelain": toast.type === "success",
              "bg-red-950/90 border-red-500/30 text-porcelain": toast.type === "error",
              "bg-charcoal/90 border-white/10 text-porcelain": toast.type === "info",
            }
          )}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-cyber-cyan" />}
          {toast.type === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-cloudburst" />}
          <p className="text-sm flex-1 font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-cloudburst hover:text-porcelain transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
