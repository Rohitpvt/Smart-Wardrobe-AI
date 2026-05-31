"use client";

import { useToast } from "@/hooks/useToast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl border backdrop-blur-xl min-w-[280px] animate-in slide-in-from-bottom-5",
            {
              "bg-surface-raised/95 border-cyber-cyan/20 text-porcelain": toast.type === "success",
              "bg-red-950/90 border-red-500/25 text-porcelain": toast.type === "error",
              "bg-surface-raised/95 border-border-default text-porcelain": toast.type === "info",
            }
          )}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-cyber-cyan shrink-0" />}
          {toast.type === "error" && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-cloudburst shrink-0" />}
          <p className="text-sm flex-1 font-medium leading-snug">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-cloudburst hover:text-porcelain transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
