"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do I need to rate every skill?",
    a: "No. Skip anything you are unsure about. Skipped skills are excluded from your results entirely — they are never scored as zero, so your readiness figure stays honest.",
  },
  {
    q: "Where do the benchmarks come from?",
    a: "Career services maintain them in the admin console. Every skill, benchmark, recommendation rule, and severity threshold is stored in the database and editable through the UI, so nothing is hardcoded.",
  },
  {
    q: "What happens if the thresholds change after I submit?",
    a: "Your dashboard reclassifies gaps against the current thresholds each time you open it, so your results always reflect the live configuration rather than a stale snapshot.",
  },
  {
    q: "How are recommendations chosen?",
    a: "Rules match your critical and moderate gaps to courses, workshops, and projects curated by your institution. Where an AI key is configured, a short personalized summary is added on top of those rules.",
  },
  {
    q: "Can I retake the assessment?",
    a: "Yes. Start a new draft any time. Your latest submission drives the dashboard, so you can track how your readiness shifts after focused practice.",
  },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white transition-colors",
              isOpen ? "border-primary/30 shadow-soft" : "border-border"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display text-base font-medium text-foreground">
                {item.q}
              </span>
              <motion.span
                animate={reduced ? undefined : { rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isOpen ? "bg-primary text-white" : "bg-accent text-primary"
                )}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={reduced ? undefined : { height: 0, opacity: 0 }}
                  animate={reduced ? undefined : { height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
