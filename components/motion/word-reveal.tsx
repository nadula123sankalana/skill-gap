"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staticVariants, wordReveal } from "@/lib/motion";

export function WordReveal({
  text,
  className,
  highlight,
  highlightClassName = "text-gradient",
  stagger = 0.055,
  delay = 0.1,
}: {
  text: string;
  className?: string;
  /** Words listed here are rendered with `highlightClassName`. */
  highlight?: string[];
  highlightClassName?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const highlighted = new Set(
    (highlight ?? []).map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );

  const isHighlighted = (word: string) =>
    highlighted.has(word.toLowerCase().replace(/[^a-z0-9]/g, ""));

  return (
    <motion.span
      className={className}
      variants={reduced ? staticVariants : staggerContainer(stagger, delay)}
      initial="hidden"
      animate="show"
      style={{ display: "inline-block" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={reduced ? staticVariants : wordReveal}
          className={isHighlighted(word) ? highlightClassName : undefined}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
