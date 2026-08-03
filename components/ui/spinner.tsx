import { cn } from "@/lib/utils";

export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent",
        className
      )}
    />
  );
}

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-6xl flex-col items-center justify-center gap-3 px-4 py-16">
      <Spinner className="h-8 w-8" label={label} />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-accent",
        className
      )}
      aria-hidden
    />
  );
}
