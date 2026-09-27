/** Human-readable band for a 0–100 readiness score (shared by dashboard + PDF). */
export function readinessLabel(readiness: number) {
  if (readiness >= 85) return "Strong internship readiness";
  if (readiness >= 70) return "Developing internship readiness";
  if (readiness >= 50) return "Emerging readiness — focus on critical gaps";
  return "Significant gaps — prioritize skill building";
}

/** Short badge form of {@link readinessLabel}. */
export function readinessBand(readiness: number) {
  if (readiness >= 85) return "Strong";
  if (readiness >= 70) return "Developing";
  if (readiness >= 50) return "Emerging";
  return "Early stage";
}
