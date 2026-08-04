"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  fadeUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  staticVariants,
  viewportOnce,
} from "@/lib/motion";

const itemPresets: Record<string, Variants> = {
  up: fadeUp,
  fade: fadeIn,
  scale: scaleIn,
};

type Tag = "div" | "ul" | "ol" | "section" | "dl";

export function StaggerGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: Tag;
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      className={className}
      variants={reduced ? staticVariants : staggerContainer(stagger, delay)}
      initial="hidden"
      // Mount animation — whileInView alone can leave admin lists stuck at opacity 0.
      animate="show"
      viewport={viewportOnce}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  preset = "up",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  preset?: keyof typeof itemPresets;
  as?: "div" | "li" | "span" | "article";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      className={className}
      variants={reduced ? staticVariants : itemPresets[preset]}
    >
      {children}
    </Comp>
  );
}
