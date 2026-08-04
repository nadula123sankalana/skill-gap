/**
 * Repair skills missing benchmarks, recompute gaps, regenerate recommendations.
 * Usage: npx tsx scripts/repair-gaps.ts
 */
import "dotenv/config";
import { ObjectId } from "mongodb";
import { collections, getClient } from "../lib/mongodb";
import { DEFAULT_BENCHMARK_SECTOR } from "../lib/constants";
import { idStr } from "../lib/types";
import { generateRecommendationsForStudent } from "../lib/recommendations";
import { recomputeCohortSummaries, refreshAdminInsights } from "../lib/cohort";
import { classifySeverity } from "../lib/constants";

async function main() {
  const c = await collections();

  const skills = await c.skills.find({}).toArray();
  let benchmarksCreated = 0;
  for (const skill of skills) {
    const existing = await c.industryBenchmarks.findOne({ skillId: skill._id });
    if (!existing) {
      await c.industryBenchmarks.insertOne({
        _id: new ObjectId(),
        skillId: skill._id,
        requiredScore: 75,
        sector: DEFAULT_BENCHMARK_SECTOR,
        updatedAt: new Date(),
      });
      benchmarksCreated += 1;
      console.log("Benchmark added for", skill.name, idStr(skill._id));
    }
  }

  const severity =
    (await c.severityConfig.findOne({})) ?? {
      greenMaxGap: 10,
      yellowMaxGap: 25,
    };

  const assessments = await c.assessments
    .find({ status: "SUBMITTED" })
    .toArray();
  let gapsCreated = 0;

  for (const a of assessments) {
    const responses = await c.assessmentResponses
      .find({ assessmentId: a._id })
      .toArray();
    const skillIds = responses.map((r) => r.skillId);
    const benchmarks = await c.industryBenchmarks
      .find({ skillId: { $in: skillIds } })
      .toArray();
    const benchBySkill = new Map(
      benchmarks.map((b) => [idStr(b.skillId), b.requiredScore])
    );

    await c.skillGaps.deleteMany({ assessmentId: a._id });
    const gaps = responses
      .map((r) => {
        const required = benchBySkill.get(idStr(r.skillId));
        if (required === undefined) return null;
        const gapScore = required - r.normalizedScore;
        return {
          _id: new ObjectId(),
          studentId: a.studentId,
          skillId: r.skillId,
          assessmentId: a._id,
          gapScore,
          severity: classifySeverity(
            gapScore,
            severity.greenMaxGap,
            severity.yellowMaxGap
          ),
        };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);

    if (gaps.length) {
      await c.skillGaps.insertMany(gaps);
      gapsCreated += gaps.length;
    }

    await generateRecommendationsForStudent(
      idStr(a.studentId),
      idStr(a._id)
    );
    console.log(
      "Assessment",
      idStr(a._id),
      "gaps",
      gaps.length,
      "student",
      idStr(a.studentId)
    );
  }

  await recomputeCohortSummaries();
  await refreshAdminInsights();

  const withGuidance = await c.recommendations.countDocuments({
    aiPersonalizedText: { $ne: null },
  });

  console.log({
    benchmarksCreated,
    gapsCreated,
    recommendationsWithGuidance: withGuidance,
  });

  await (await getClient()).close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
