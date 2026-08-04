import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb";
import { idStr, type Severity } from "@/lib/types";

type GapForGuidance = {
  skillId: ObjectId;
  severity: Severity;
  gapScore: number;
};

/**
 * Rule-based student guidance from gap scores + skill library names.
 * Replaces generative AI personalization.
 */
export function buildStudentGuidance(params: {
  gaps: GapForGuidance[];
  skillNameById: Map<string, string>;
}): string | null {
  const ranked = [...params.gaps].sort((a, b) => {
    const order: Record<Severity, number> = { RED: 0, YELLOW: 1, GREEN: 2 };
    const bySev = order[a.severity] - order[b.severity];
    if (bySev !== 0) return bySev;
    return b.gapScore - a.gapScore;
  });

  const focus = ranked.filter((g) => g.severity === "RED" || g.severity === "YELLOW");
  if (focus.length === 0) return null;

  const top = focus.slice(0, 3);
  const names = top.map(
    (g) => params.skillNameById.get(idStr(g.skillId)) ?? "a core skill"
  );
  const critical = top.filter((g) => g.severity === "RED").length;
  const moderate = top.filter((g) => g.severity === "YELLOW").length;

  const focusList =
    names.length === 1
      ? names[0]
      : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

  const severityPhrase =
    critical > 0 && moderate > 0
      ? `${critical} critical and ${moderate} moderate gap${moderate === 1 ? "" : "s"}`
      : critical > 0
        ? `${critical} critical gap${critical === 1 ? "" : "s"}`
        : `${moderate} moderate gap${moderate === 1 ? "" : "s"}`;

  return (
    `Your assessment shows ${severityPhrase} against the industry skill library benchmarks. ` +
    `Prioritise ${focusList} next — close the largest gaps first using the matched learning resources below. ` +
    `Retake the assessment after practice to confirm your readiness score improves.`
  );
}

/**
 * Deterministic free-text insight from stored responses (no generative AI).
 */
export async function summarizeFreeTextThemes(): Promise<string> {
  const c = await collections();
  const responses = await c.assessmentFreeTextResponses
    .find({})
    .limit(500)
    .toArray();

  if (responses.length === 0) {
    return "No free-text assessment responses are available yet.";
  }

  const byKey = new Map<string, string[]>();
  for (const r of responses) {
    const list = byKey.get(r.questionKey) ?? [];
    list.push(r.responseText.trim());
    byKey.set(r.questionKey, list);
  }

  const label: Record<string, string> = {
    career_goals: "Career goals",
    biggest_challenge: "Biggest challenges",
  };

  const parts: string[] = [
    `Analysed ${responses.length} anonymous free-text response${responses.length === 1 ? "" : "s"} across ${byKey.size} question${byKey.size === 1 ? "" : "s"}.`,
  ];

  for (const [key, texts] of Array.from(byKey.entries())) {
    const title = label[key] ?? key.replace(/_/g, " ");
    const keywords = topKeywords(texts, 5);
    const samples = texts
      .filter((t) => t.length > 0)
      .slice(0, 2)
      .map((t) => (t.length > 90 ? `${t.slice(0, 87)}…` : t));

    let line = `${title}: ${texts.length} response${texts.length === 1 ? "" : "s"}`;
    if (keywords.length > 0) {
      line += `. Frequent terms: ${keywords.join(", ")}`;
    }
    if (samples.length > 0) {
      line += `. Example: “${samples[0]}”`;
    }
    parts.push(line);
  }

  return parts.join(" ");
}

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "i",
  "my",
  "me",
  "we",
  "our",
  "you",
  "your",
  "it",
  "this",
  "that",
  "with",
  "as",
  "from",
  "have",
  "has",
  "had",
  "not",
  "do",
  "does",
  "did",
  "will",
  "would",
  "can",
  "could",
  "about",
  "into",
  "more",
  "also",
  "very",
  "just",
  "than",
  "then",
  "so",
  "if",
  "when",
  "what",
  "which",
  "who",
  "how",
  "want",
  "like",
  "get",
  "got",
]);

function topKeywords(texts: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const text of texts) {
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOP.has(t));
    for (const t of tokens) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}
