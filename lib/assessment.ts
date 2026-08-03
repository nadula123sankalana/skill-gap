import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb";
import {
  classifySeverity,
  DEFAULT_BENCHMARK_SECTOR,
  normalizeRating,
} from "@/lib/constants";
import { idStr, oid, type Severity } from "@/lib/types";
import { generateRecommendationsForStudent } from "@/lib/recommendations";
import { recomputeCohortSummaries } from "@/lib/cohort";

export type RatingInput = {
  skillId: string;
  /** null / undefined = skipped — excluded from scoring and gap analysis */
  rawRating: number | null;
};

export type FreeTextInput = {
  questionKey: string;
  responseText: string;
};

/**
 * Persist draft or submit an assessment.
 *
 * Skipped skills (no rating) are intentionally NOT written as AssessmentResponse
 * rows and are excluded from gap analysis. They must never be treated as score 0 —
 * a missing answer is not the same as "Poor".
 */
export async function saveAssessment(params: {
  studentId: string;
  assessmentId?: string | null;
  ratings: RatingInput[];
  freeText: FreeTextInput[];
  submit: boolean;
}) {
  const c = await collections();
  const studentOid = oid(params.studentId);
  const now = new Date();

  let assessmentId: ObjectId;
  if (params.assessmentId) {
    assessmentId = oid(params.assessmentId);
    const existing = await c.assessments.findOne({
      _id: assessmentId,
      studentId: studentOid,
    });
    if (!existing) {
      throw new Error("Assessment not found");
    }
    if (existing.status === "SUBMITTED") {
      throw new Error("This assessment is already submitted");
    }
  } else {
    assessmentId = new ObjectId();
    await c.assessments.insertOne({
      _id: assessmentId,
      studentId: studentOid,
      submittedAt: null,
      status: "DRAFT",
      createdAt: now,
    });
  }

  // Replace draft responses for answered skills only
  await c.assessmentResponses.deleteMany({ assessmentId });
  await c.assessmentFreeTextResponses.deleteMany({ assessmentId });

  const answered = params.ratings.filter(
    (r): r is RatingInput & { rawRating: number } =>
      r.rawRating !== null && r.rawRating !== undefined
  );

  if (answered.length > 0) {
    await c.assessmentResponses.insertMany(
      answered.map((r) => ({
        _id: new ObjectId(),
        assessmentId,
        skillId: oid(r.skillId),
        rawRating: r.rawRating,
        normalizedScore: normalizeRating(r.rawRating),
      }))
    );
  }

  const freeTexts = params.freeText.filter((f) => f.responseText.trim());
  if (freeTexts.length > 0) {
    await c.assessmentFreeTextResponses.insertMany(
      freeTexts.map((f) => ({
        _id: new ObjectId(),
        assessmentId,
        questionKey: f.questionKey,
        responseText: f.responseText.trim(),
      }))
    );
  }

  if (!params.submit) {
    await c.assessments.updateOne(
      { _id: assessmentId },
      { $set: { status: "DRAFT", submittedAt: null } }
    );
    return { assessmentId: idStr(assessmentId), status: "DRAFT" as const };
  }

  if (answered.length === 0) {
    throw new Error("Answer at least one skill before submitting");
  }

  await c.assessments.updateOne(
    { _id: assessmentId },
    { $set: { status: "SUBMITTED", submittedAt: now } }
  );

  await computeAndStoreGaps({
    studentId: studentOid,
    assessmentId,
  });

  await generateRecommendationsForStudent(params.studentId, idStr(assessmentId));
  await recomputeCohortSummaries();

  return { assessmentId: idStr(assessmentId), status: "SUBMITTED" as const };
}

async function computeAndStoreGaps(params: {
  studentId: ObjectId;
  assessmentId: ObjectId;
}) {
  const c = await collections();
  const severity =
    (await c.severityConfig.findOne({})) ?? {
      greenMaxGap: 10,
      yellowMaxGap: 25,
    };

  const responses = await c.assessmentResponses
    .find({ assessmentId: params.assessmentId })
    .toArray();

  const skillIds = responses.map((r) => r.skillId);
  const benchmarks = await c.industryBenchmarks
    .find({ skillId: { $in: skillIds } })
    .toArray();

  // Prefer default sector; otherwise first available for the skill
  const benchmarkBySkill = new Map<string, number>();
  for (const b of benchmarks) {
    const key = idStr(b.skillId);
    if (b.sector === DEFAULT_BENCHMARK_SECTOR || !benchmarkBySkill.has(key)) {
      if (b.sector === DEFAULT_BENCHMARK_SECTOR) {
        benchmarkBySkill.set(key, b.requiredScore);
      } else if (!benchmarkBySkill.has(key)) {
        benchmarkBySkill.set(key, b.requiredScore);
      }
    }
  }
  // Second pass: ensure default sector wins
  for (const b of benchmarks) {
    if (b.sector === DEFAULT_BENCHMARK_SECTOR) {
      benchmarkBySkill.set(idStr(b.skillId), b.requiredScore);
    }
  }

  await c.skillGaps.deleteMany({ assessmentId: params.assessmentId });

  const gaps = responses
    .map((r) => {
      const required = benchmarkBySkill.get(idStr(r.skillId));
      if (required === undefined) return null;
      const gapScore = required - r.normalizedScore;
      const severityLevel: Severity = classifySeverity(
        gapScore,
        severity.greenMaxGap,
        severity.yellowMaxGap
      );
      return {
        _id: new ObjectId(),
        studentId: params.studentId,
        skillId: r.skillId,
        assessmentId: params.assessmentId,
        gapScore,
        severity: severityLevel,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  if (gaps.length > 0) {
    await c.skillGaps.insertMany(gaps);
  }
}

/** Reclassify existing gaps using live SeverityConfig (admin threshold changes). */
export async function reclassifyGapsForAssessment(assessmentId: string) {
  const c = await collections();
  const severity =
    (await c.severityConfig.findOne({})) ?? {
      greenMaxGap: 10,
      yellowMaxGap: 25,
    };
  const gaps = await c.skillGaps
    .find({ assessmentId: oid(assessmentId) })
    .toArray();

  for (const gap of gaps) {
    const next = classifySeverity(
      gap.gapScore,
      severity.greenMaxGap,
      severity.yellowMaxGap
    );
    if (next !== gap.severity) {
      await c.skillGaps.updateOne(
        { _id: gap._id },
        { $set: { severity: next } }
      );
    }
  }
}
