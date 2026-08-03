"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";

/** Animated SVG progress ring used as the dashboard's readiness anchor. */
export function ReadinessRing({
  value,
  size = 132,
  stroke = 10,
  label = "readiness",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped)} percent ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="readiness-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5FDCC0" />
            <stop offset="100%" stopColor="#22C39E" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#readiness-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-medium text-white">
          <CountUp to={Math.round(clamped)} />
        </span>
        <span className="text-[0.65rem] uppercase tracking-[0.12em] text-white/60">
          out of 100
        </span>
      </div>
    </div>
  );
}
