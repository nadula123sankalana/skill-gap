import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared styling for native `<select>` elements so they match `Input`. */
export const nativeSelectClass =
  "flex h-11 w-full rounded-xl border border-input bg-surface px-4 text-sm text-foreground transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";
