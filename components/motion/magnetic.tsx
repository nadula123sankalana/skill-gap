"use client";

import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

/** Wraps content in a hover-lift interaction. Used for cards and CTAs. */
export function Magnetic({
  children,
  className,
  lift = 6,
  scale = 1.02,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale }}
      whileTap={{ scale: 0.985 }}
      transition={springSnappy}
    >
      {children}
    </motion.div>
  );
}
