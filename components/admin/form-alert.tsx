"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Alert } from "@/components/ui/alert";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Server-action feedback that expands and collapses instead of snapping in. */
export function FormAlert({
  message,
  success,
  className,
}: {
  message?: string;
  success?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          initial={reduced ? undefined : { opacity: 0, height: 0 }}
          animate={reduced ? undefined : { opacity: 1, height: "auto" }}
          exit={reduced ? undefined : { opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: easeOut }}
          className={cn("overflow-hidden", className)}
        >
          <Alert variant={success ? "success" : "destructive"}>{message}</Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
