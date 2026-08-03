import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SkillsManager } from "./skills-manager";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const { skills } = await collections();
  const docs = await skills.find({}).sort({ name: 1 }).toArray();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Skills"
        description="Create and edit the skill catalogue used in assessments and gap analysis. Deleting a skill also removes its benchmarks, rules, responses, and gaps."
      />
      <div className="mt-8">
        <SkillsManager
          skills={docs.map((s) => ({
            id: idStr(s._id),
            name: s.name,
            category: s.category,
            description: s.description,
          }))}
        />
      </div>
    </div>
  );
}
