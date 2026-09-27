"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "@/components/severity-badge";

type Severity = "RED" | "YELLOW" | "GREEN";

export type SkillGapRow = {
  id: string;
  name: string;
  score: number;
  benchmark: number | null;
  gap: number;
  severity: Severity;
};

const fill: Record<Severity, string> = {
  RED: "bg-severity-red",
  YELLOW: "bg-severity-yellow",
  GREEN: "bg-severity-green",
};

const filters: { value: Severity | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "RED", label: "Critical" },
  { value: "YELLOW", label: "Moderate" },
  { value: "GREEN", label: "On track" },
];

/** Filterable skill list: score bar with a benchmark marker per skill. */
export function SkillGapList({ rows }: { rows: SkillGapRow[] }) {
  const [filter, setFilter] = useState<Severity | "ALL">("ALL");
  const visible =
    filter === "ALL" ? rows : rows.filter((r) => r.severity === filter);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter by status"
        className="flex flex-wrap gap-2"
      >
        {filters.map((f) => {
          const count =
            f.value === "ALL"
              ? rows.length
              : rows.filter((r) => r.severity === f.value).length;
          const selected = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-foreground bg-foreground text-white"
                  : "border-border bg-white text-muted hover:border-primary/40 hover:text-foreground"
              )}
            >
              {f.label}
              <span className="tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No skills in this category.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((r) => (
              <li
                key={r.id}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {r.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {r.gap > 0
                      ? `${r.gap.toFixed(0)} pts below benchmark`
                      : "Meets benchmark"}
                  </p>
                </div>

                <ScoreBar
                  score={r.score}
                  benchmark={r.benchmark}
                  severity={r.severity}
                />

                <SeverityBadge
                  severity={r.severity}
                  className="justify-self-start sm:justify-self-end"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ScoreBar({
  score,
  benchmark,
  severity,
}: {
  score: number;
  benchmark: number | null;
  severity: Severity;
}) {
  const s = Math.max(0, Math.min(100, score));
  const b = benchmark === null ? null : Math.max(0, Math.min(100, benchmark));
  return (
    <div>
      <div
        className="relative h-2 w-full rounded-full bg-accent"
        role="img"
        aria-label={`Score ${Math.round(s)} of 100${
          b === null ? "" : `, benchmark ${Math.round(b)}`
        }`}
      >
        <div
          className={cn("h-full rounded-full", fill[severity])}
          style={{ width: `${Math.max(2, s)}%` }}
        />
        {b !== null && (
          <span
            className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded-full bg-foreground/70"
            style={{ left: `${b}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-[0.7rem] tabular-nums text-muted">
        <span>
          You <span className="font-semibold text-foreground">{Math.round(s)}</span>
        </span>
        {b !== null && (
          <span>
            Benchmark{" "}
            <span className="font-semibold text-foreground">{Math.round(b)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
