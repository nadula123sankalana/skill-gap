import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";

type GapProfileItem = {
  skillName: string;
  severity: string;
  gapScore: number;
  normalizedScore: number;
};

/**
 * Gemini free-tier helper (AI Studio key).
 * Models allowed: gemini-2.5-flash or gemini-2.5-flash-lite only.
 * All failures are caught — callers must keep working without AI text.
 */
const GEMINI_MODEL = "gemini-2.5-flash";

export async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn("Gemini API error:", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (err) {
    console.warn("Gemini call failed:", err);
    return null;
  }
}

export async function personalizeRecommendationsWithGemini(
  studentId: string,
  assessmentId: import("mongodb").ObjectId
): Promise<void> {
  try {
    const c = await collections();
    const { oid } = await import("@/lib/types");
    const gaps = await c.skillGaps
      .find({ studentId: oid(studentId), assessmentId })
      .toArray();

    if (gaps.length === 0) return;

    const skillIds = gaps.map((g) => g.skillId);
    const skills = await c.skills.find({ _id: { $in: skillIds } }).toArray();
    const skillName = new Map(skills.map((s) => [idStr(s._id), s.name]));

    const responses = await c.assessmentResponses
      .find({ assessmentId })
      .toArray();
    const scoreBySkill = new Map(
      responses.map((r) => [idStr(r.skillId), r.normalizedScore])
    );

    const profile: GapProfileItem[] = gaps
      .map((g) => ({
        skillName: skillName.get(idStr(g.skillId)) ?? "Unknown",
        severity: g.severity,
        gapScore: g.gapScore,
        normalizedScore: scoreBySkill.get(idStr(g.skillId)) ?? 0,
      }))
      .sort((a, b) => b.gapScore - a.gapScore);

    const weakest = profile.slice(0, 3);
    const prompt = `You are a supportive university career advisor. Write one short encouraging paragraph (3–5 sentences) for a student preparing for internships. Reference their weakest skills specifically: ${weakest
      .map(
        (w) =>
          `${w.skillName} (${w.severity}, gap ${w.gapScore.toFixed(0)}, score ${w.normalizedScore.toFixed(0)})`
      )
      .join("; ")}. Be specific, practical, and warm. Do not use markdown or bullet points.`;

    const text = await callGemini(prompt);
    if (!text) return;

    await c.recommendations.updateMany(
      { studentId: oid(studentId) },
      { $set: { aiPersonalizedText: text } }
    );
  } catch (err) {
    console.warn("personalizeRecommendationsWithGemini failed:", err);
  }
}

export async function summarizeFreeTextThemes(): Promise<string | null> {
  const c = await collections();
  const responses = await c.assessmentFreeTextResponses
    .find({})
    .limit(200)
    .toArray();

  if (responses.length === 0) {
    return "No free-text assessment responses are available yet.";
  }

  const sample = responses
    .map((r) => `- [${r.questionKey}] ${r.responseText}`)
    .join("\n")
    .slice(0, 6000);

  const prompt = `You are analyzing anonymous student internship-readiness survey free-text answers for a university career office. Summarize the main themes in 1 short paragraph (4–6 sentences). Be concrete. Do not invent data.\n\nResponses:\n${sample}`;

  const text = await callGemini(prompt);
  return (
    text ??
    "AI summary is temporarily unavailable. Free-text responses are still stored and can be reviewed manually."
  );
}
