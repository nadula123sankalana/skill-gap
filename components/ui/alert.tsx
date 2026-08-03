import * as React from "react";
import { cn } from "@/lib/utils";

function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive" | "success";
}) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border px-4 py-3 text-sm",
        variant === "default" && "border-border bg-accent text-foreground",
        variant === "destructive" &&
          "border-severity-red/30 bg-severity-red/10 text-severity-red",
        variant === "success" &&
          "border-severity-green/30 bg-severity-green/10 text-severity-green",
        className
      )}
      {...props}
    />
  );
}

export { Alert };
