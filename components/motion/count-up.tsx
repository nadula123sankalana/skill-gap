"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export function CountUp({
  to,
  from = 0,
  suffix = "",
  prefix = "",
  duration = 1.6,
  decimals = 0,
  className,
}: {
  to: number;
  from?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduced || !inView) {
      if (reduced) node.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(value) {
        node.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [inView, reduced, from, to, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${from.toFixed(decimals)}${suffix}`}
    </span>
  );
}
