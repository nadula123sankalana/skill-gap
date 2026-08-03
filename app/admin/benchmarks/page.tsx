import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
      <AdminPageHeader
        eyebrow="Standards"
        title="Industry benchmarks"
        description="Set the target score per skill and sector used in gap calculations. Scores use the same 0–100 scale as normalized assessment results."
      />
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
