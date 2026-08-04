import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb";
import { idStr, oid } from "@/lib/types";
import { summarizeFreeTextThemes } from "@/lib/guidance";

export async function recomputeCohortSummaries() {
  const c = await collections();
  const submitted = await c.assessments
    .find({ status: "SUBMITTED" })
    .project({ _id: 1 })
    .toArray();
  const assessmentIds = submitted.map((a) => a._id);

  if (assessmentIds.length === 0) {
    await c.cohortSummaries.deleteMany({});
    return;
  }

  const responses = await c.assessmentResponses
    .find({ assessmentId: { $in: assessmentIds } })
    .toArray();

  const bySkill = new Map<string, number[]>();
  for (const r of responses) {
    const key = idStr(r.skillId);
    const list = bySkill.get(key) ?? [];
    list.push(r.normalizedScore);
    bySkill.set(key, list);
  }

  const now = new Date();
  for (const [skillId, scores] of Array.from(bySkill.entries())) {
    const meanScore =
      scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    await c.cohortSummaries.updateOne(
      { skillId: oid(skillId) },
      {
        $set: {
          skillId: oid(skillId),
          meanScore,
          computedAt: now,
        },
      },
      { upsert: true }
    );
  }

  const activeSkillOids = Array.from(bySkill.keys()).map((id) => oid(id));
  await c.cohortSummaries.deleteMany({
    skillId: { $nin: activeSkillOids },
  });
}

export async function refreshAdminInsights() {
  const c = await collections();
  const text = await summarizeFreeTextThemes();

  const existing = await c.adminInsights.findOne({});
  if (existing) {
    await c.adminInsights.updateOne(
      { _id: existing._id },
      { $set: { summaryText: text, refreshedAt: new Date() } }
    );
  } else {
    await c.adminInsights.insertOne({
      _id: new ObjectId(),
      summaryText: text,
      refreshedAt: new Date(),
    });
  }
  return text;
}
