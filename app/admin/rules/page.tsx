import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { RulesManager } from "./rules-manager";

export const dynamic = "force-dynamic";

export default async function AdminRulesPage() {
  const { skills, recommendationRules } = await collections();
  const [skillDocs, ruleDocs] = await Promise.all([
    skills.find({}).sort({ name: 1 }).project({ name: 1 }).toArray(),
    recommendationRules
      .find({})
      .sort({ priority: 1, minGapThreshold: -1 })
      .toArray(),
  ]);

  const skillNameById = new Map(
    skillDocs.map((s) => [idStr(s._id), s.name] as const)
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Recommendation rules
      </h1>
      <p className="mt-2 text-muted">
        Map gap thresholds to courses, workshops, and projects students can
        pursue.
      </p>
      <div className="mt-8">
        <RulesManager
          skills={skillDocs.map((s) => ({
            id: idStr(s._id),
            name: s.name,
          }))}
          rules={ruleDocs.map((r) => ({
            id: idStr(r._id),
            skillId: idStr(r.skillId),
            minGapThreshold: r.minGapThreshold,
            resourceTitle: r.resourceTitle,
            resourceUrl: r.resourceUrl,
            resourceType: r.resourceType,
            priority: r.priority,
            skill: {
              name: skillNameById.get(idStr(r.skillId)) ?? "Unknown skill",
            },
          }))}
        />
      </div>
    </div>
  );
}
