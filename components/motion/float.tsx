"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOut, springSoft } from "@/lib/motion";

export function Float({
  children,
  className,
  distance = 12,
  duration = 6,
  delay = 0,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const shift = reverse ? distance : -distance;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.86, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...springSoft, delay }}
    >
      <motion.div
        animate={{ y: [0, shift, 0] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: easeOut,
        }}
        whileHover={{ scale: 1.05, transition: { duration: 0.25 } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
