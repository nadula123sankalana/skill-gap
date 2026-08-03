"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { saveAssessment } from "@/lib/assessment";
import { generateRecommendationsForStudent } from "@/lib/recommendations";
import { refreshAdminInsights } from "@/lib/cohort";
import type { ActionResult } from "@/app/actions/auth";

async function requireStudent() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function parseAssessmentForm(formData: FormData) {
  const assessmentId = String(formData.get("assessmentId") || "") || null;
  const skillIds = formData.getAll("skillId").map(String);
  const ratings: { skillId: string; rawRating: number | null }[] = [];

  for (const skillId of skillIds) {
    const raw = formData.get(`rating_${skillId}`);
    if (raw === null || raw === "" || raw === "skip") {
      // Skipped — excluded from scoring (not treated as 0)
      ratings.push({ skillId, rawRating: null });
    } else {
      const n = Number(raw);
      ratings.push({
        skillId,
        rawRating: Number.isFinite(n) ? n : null,
      });
    }
  }

  const freeText = [
    {
      questionKey: "career_goals",
      responseText: String(formData.get("freeText_career_goals") ?? ""),
    },
    {
      questionKey: "biggest_challenge",
      responseText: String(formData.get("freeText_biggest_challenge") ?? ""),
    },
  ];

  return { assessmentId, ratings, freeText };
}

const ratingSchema = z.object({
  skillId: z.string().min(1),
  rawRating: z.number().int().min(1).max(4).nullable(),
});

export async function handleAssessmentForm(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const intent = String(formData.get("intent") ?? "submit");
  if (intent === "draft") {
    return saveDraftAssessment(_prev, formData);
  }
  return submitAssessment(_prev, formData);
}

export async function saveDraftAssessment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireStudent();
  const parsed = parseAssessmentForm(formData);

  for (const r of parsed.ratings) {
    const check = ratingSchema.safeParse(r);
    if (!check.success) {
      return { success: false, message: "Invalid rating value." };
    }
  }

  try {
    const result = await saveAssessment({
      studentId: session.user.id,
      assessmentId: parsed.assessmentId,
      ratings: parsed.ratings,
      freeText: parsed.freeText,
      submit: false,
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assessment");
    return {
      success: true,
      message: `Draft saved (${result.assessmentId}).`,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Could not save draft.",
    };
  }
}

export async function submitAssessment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireStudent();
  const parsed = parseAssessmentForm(formData);

  const answered = parsed.ratings.filter((r) => r.rawRating !== null);
  if (answered.length === 0) {
    return {
      success: false,
      message: "Rate at least one skill before submitting.",
    };
  }

  for (const r of parsed.ratings) {
    const check = ratingSchema.safeParse(r);
    if (!check.success) {
      return { success: false, message: "Invalid rating value." };
    }
  }

  try {
    await saveAssessment({
      studentId: session.user.id,
      assessmentId: parsed.assessmentId,
      ratings: parsed.ratings,
      freeText: parsed.freeText,
      submit: true,
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assessment");
    revalidatePath("/admin/dashboard");
    return {
      success: true,
      message: "Assessment submitted. Redirecting to your dashboard…",
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Could not submit assessment.",
    };
  }
}

export async function refreshRecommendationsAction(): Promise<void> {
  const session = await requireStudent();
  await generateRecommendationsForStudent(session.user.id);
  revalidatePath("/dashboard");
}

export async function refreshInsightsAction(): Promise<void> {
  await requireAdmin();
  await refreshAdminInsights();
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
}
