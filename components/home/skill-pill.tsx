import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Glass "signal" card that floats around the hero, echoing the reference UI. */
export function SkillPill({
  skill,
  category,
  match,
  initials,
  accent = "teal",
  className,
}: {
  skill: string;
  category: string;
  match: number;
  initials: string;
  accent?: "teal" | "blue" | "violet" | "amber";
  className?: string;
}) {
  const accents: Record<string, string> = {
    teal: "bg-brand-teal text-ink-900",
    blue: "bg-brand-blue text-white",
    violet: "bg-brand-violet text-white",
    amber: "bg-[#F5B942] text-ink-900",
  };

  return (
    <div
      className={cn(
        "glass flex w-[16.5rem] items-center gap-3 rounded-full py-2.5 pl-2.5 pr-4 shadow-glass",
        className
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          accents[accent]
        )}
        aria-hidden
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">
          {skill}
        </span>
        <span className="block truncate text-[0.7rem] text-white/70">
          {category}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.7rem] font-semibold text-white">
          {match}%
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-white/70" aria-hidden />
      </span>
    </div>
  );
}
