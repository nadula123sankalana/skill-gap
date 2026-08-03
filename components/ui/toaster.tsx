"use client";

import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:max-w-sm sm:flex-col"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts
        .filter((t) => t.open !== false)
        .map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 shadow-soft transition-all duration-200",
              t.variant === "destructive" &&
                "border-severity-red/40 bg-surface text-foreground",
              t.variant === "success" &&
                "border-severity-green/40 bg-surface text-foreground",
              (!t.variant || t.variant === "default") &&
                "border-border bg-surface text-foreground"
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                t.variant === "destructive" && "bg-severity-red",
                t.variant === "success" && "bg-severity-green",
                (!t.variant || t.variant === "default") && "bg-primary"
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              {t.title && (
                <p className="text-sm font-semibold leading-none">{t.title}</p>
              )}
              {t.description && (
                <p className="text-sm text-muted">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-muted hover:bg-accent hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
    </div>
  );
}
