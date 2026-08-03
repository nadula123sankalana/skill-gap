"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, fadeIn, scaleIn, slideFromLeft, slideFromRight, staticVariants, viewportOnce } from "@/lib/motion";

const presets: Record<string, Variants> = {
  up: fadeUp,
  fade: fadeIn,
  scale: scaleIn,
  left: slideFromLeft,
  right: slideFromRight,
};

export type RevealPreset = keyof typeof presets;

export function Reveal({
  children,
  className,
  preset = "up",
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  preset?: RevealPreset;
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "header" | "article";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={reduced ? staticVariants : presets[preset]}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={reduced ? undefined : { delay }}
    >
      {children}
    </Tag>
  );
}
