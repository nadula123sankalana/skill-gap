import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb";
import { MAX_RECOMMENDATIONS_PER_SKILL } from "@/lib/constants";
import { oid } from "@/lib/types";
import { personalizeRecommendationsWithGemini } from "@/lib/gemini";

const FALLBACK_MESSAGE =
  "No matching learning resource is configured for this gap yet. An administrator has been flagged to add a recommendation rule.";

/**
 * For each RED/YELLOW gap on the student's latest submitted assessment:
 * match RecommendationRules (skillId + gapScore >= minGapThreshold),
 * take top MAX_RECOMMENDATIONS_PER_SKILL by priority.
 * If none match, still create a Recommendation with ruleId=null (fallback).
 */
export async function generateRecommendationsForStudent(
  studentId: string,
  assessmentId?: string
) {
  const c = await collections();
  const studentOid = oid(studentId);

  let assessmentOid: ObjectId | null = null;
  if (assessmentId) {
    assessmentOid = oid(assessmentId);
  } else {
    const latest = await c.assessments.findOne(
      { studentId: studentOid, status: "SUBMITTED" },
      { sort: { submittedAt: -1 } }
    );
    if (!latest) return { created: 0 };
    assessmentOid = latest._id;
  }

  const gaps = await c.skillGaps
    .find({
      studentId: studentOid,
      assessmentId: assessmentOid,
      severity: { $in: ["RED", "YELLOW"] },
    })
    .toArray();

  // Replace prior recommendations for this student
  await c.recommendations.deleteMany({ studentId: studentOid });

  const toInsert: {
    _id: ObjectId;
    studentId: ObjectId;
    skillId: ObjectId;
    ruleId: ObjectId | null;
    aiPersonalizedText: string | null;
    status: "PENDING";
    createdAt: Date;
  }[] = [];

  const now = new Date();

  for (const gap of gaps) {
    const rules = await c.recommendationRules
      .find({
        skillId: gap.skillId,
        minGapThreshold: { $lte: gap.gapScore },
      })
      .sort({ priority: 1 })
      .limit(MAX_RECOMMENDATIONS_PER_SKILL)
      .toArray();

    if (rules.length === 0) {
      toInsert.push({
        _id: new ObjectId(),
        studentId: studentOid,
        skillId: gap.skillId,
        ruleId: null,
        aiPersonalizedText: null,
        status: "PENDING",
        createdAt: now,
      });
    } else {
      for (const rule of rules) {
        toInsert.push({
          _id: new ObjectId(),
          studentId: studentOid,
          skillId: gap.skillId,
          ruleId: rule._id,
          aiPersonalizedText: null,
          status: "PENDING",
          createdAt: now,
        });
      }
    }
  }

  if (toInsert.length > 0) {
    await c.recommendations.insertMany(toInsert);
  }

  // Gemini personalization (non-fatal if it fails)
  await personalizeRecommendationsWithGemini(studentId, assessmentOid);

  return { created: toInsert.length };
}

export { FALLBACK_MESSAGE };
