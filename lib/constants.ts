/**
 * How many matching recommendation rules to keep per skill (by priority).
 * Easy to find and change.
 */
export const MAX_RECOMMENDATIONS_PER_SKILL = 2;

/** Default industry sector used when multiple benchmarks exist for a skill. */
export const DEFAULT_BENCHMARK_SECTOR = "Software Engineering";

/** Rating scale: Very Good=4 … Poor=1 → normalized 0–100 */
export function normalizeRating(rawRating: number): number {
  // Map 1–4 onto 25–100 so Poor is not silently scored as 0.
  return (rawRating / 4) * 100;
}

export function classifySeverity(
  gapScore: number,
  greenMaxGap: number,
  yellowMaxGap: number
): "GREEN" | "YELLOW" | "RED" {
  if (gapScore <= greenMaxGap) return "GREEN";
  if (gapScore <= yellowMaxGap) return "YELLOW";
  return "RED";
}
