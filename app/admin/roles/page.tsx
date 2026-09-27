import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RolesManager } from "./roles-manager";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const { skills, internshipRoles } = await collections();
  const [skillDocs, roleDocs] = await Promise.all([
    skills.find({}).sort({ name: 1 }).project({ name: 1 }).toArray(),
    internshipRoles.find({}).sort({ priority: 1, title: 1 }).toArray(),
  ]);

  const skillNameById = new Map(
    skillDocs.map((s) => [idStr(s._id), s.name] as const)
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Matching"
        title="Internship roles"
        description="Define role skill floors used for transparent, rule-based internship matching. Match indicators are not job guarantees — they show how a student’s assessed scores compare to configured requirements."
      />
      <div className="mt-8">
        <RolesManager
          skills={skillDocs.map((s) => ({
            id: idStr(s._id),
            name: s.name,
          }))}
          roles={roleDocs.map((r) => ({
            id: idStr(r._id),
            title: r.title,
            summary: r.summary,
            priority: r.priority,
            requirements: r.requirements.map((req) => ({
              skillId: idStr(req.skillId),
              minScore: req.minScore,
              skillName: skillNameById.get(idStr(req.skillId)) ?? "Unknown skill",
            })),
          }))}
        />
      </div>
    </div>
  );
}
