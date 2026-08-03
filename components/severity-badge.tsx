import { cn } from "@/lib/utils";

type SeverityLevel = "RED" | "YELLOW" | "GREEN";

const styles: Record<SeverityLevel, string> = {
  RED: "bg-severity-red/10 text-severity-red ring-severity-red/25",
  YELLOW: "bg-severity-yellow/10 text-severity-yellow ring-severity-yellow/25",
  GREEN: "bg-severity-green/10 text-severity-green ring-severity-green/25",
};

const dots: Record<SeverityLevel, string> = {
  RED: "bg-severity-red animate-dot-pulse",
  YELLOW: "bg-severity-yellow",
  GREEN: "bg-severity-green",
};

const labels: Record<SeverityLevel, string> = {
  RED: "Critical",
  YELLOW: "Moderate",
  GREEN: "On track",
};

export function SeverityBadge({
  severity,
  className,
  showLabel = true,
}: {
  severity: SeverityLevel;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        styles[severity],
        className
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", dots[severity])}
        aria-hidden
      />
      {showLabel ? labels[severity] : severity}
    </span>
  );
}
