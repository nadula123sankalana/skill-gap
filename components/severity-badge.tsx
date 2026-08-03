import { cn } from "@/lib/utils";

type SeverityLevel = "RED" | "YELLOW" | "GREEN";

const styles: Record<SeverityLevel, string> = {
  RED: "bg-severity-red/10 text-severity-red border-severity-red/30",
  YELLOW: "bg-severity-yellow/10 text-severity-yellow border-severity-yellow/30",
  GREEN: "bg-severity-green/10 text-severity-green border-severity-green/30",
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
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs font-medium",
        styles[severity],
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-severity-red": severity === "RED",
          "bg-severity-yellow": severity === "YELLOW",
          "bg-severity-green": severity === "GREEN",
        })}
        aria-hidden
      />
      {showLabel ? labels[severity] : severity}
    </span>
  );
}
