"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const reduced = useReducedMotion();

  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, x: 24, scale: 0.96 },
        transition: springSnappy,
      };

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:max-w-sm sm:flex-col"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {toasts
          .filter((t) => t.open !== false)
          .map((t) => (
            <motion.div
              key={t.id}
              layout={!reduced}
              role="status"
              {...motionProps}
              className={cn(
                "pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl border bg-surface px-4 py-3 text-foreground shadow-lift",
                t.variant === "destructive" && "border-severity-red/40",
                t.variant === "success" && "border-severity-green/40",
                (!t.variant || t.variant === "default") && "border-border"
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
                  <p className="text-sm font-semibold leading-none">
                    {t.title}
                  </p>
                )}
                {t.description && (
                  <p className="text-sm text-muted">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-full p-1 text-muted transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
