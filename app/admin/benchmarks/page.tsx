import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { BenchmarksManager } from "./benchmarks-manager";

export const dynamic = "force-dynamic";

export default async function AdminBenchmarksPage() {
  const { skills, industryBenchmarks } = await collections();
  const [skillDocs, benchmarkDocs] = await Promise.all([
    skills.find({}).sort({ name: 1 }).project({ name: 1 }).toArray(),
    industryBenchmarks.find({}).sort({ sector: 1, requiredScore: -1 }).toArray(),
  ]);

  const skillNameById = new Map(
    skillDocs.map((s) => [idStr(s._id), s.name] as const)
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Industry benchmarks
      </h1>
      <p className="mt-2 text-muted">
        Set the target score per skill and sector used in gap calculations.
      </p>
      <div className="mt-8">
        <BenchmarksManager
          skills={skillDocs.map((s) => ({
            id: idStr(s._id),
            name: s.name,
          }))}
          benchmarks={benchmarkDocs.map((b) => ({
            id: idStr(b._id),
            skillId: idStr(b.skillId),
            requiredScore: b.requiredScore,
            sector: b.sector,
            skill: {
              name: skillNameById.get(idStr(b.skillId)) ?? "Unknown skill",
            },
          }))}
        />
      </div>
    </div>
  );
}
