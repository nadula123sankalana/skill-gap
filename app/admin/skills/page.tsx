import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { SkillsManager } from "./skills-manager";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const { skills } = await collections();
  const docs = await skills.find({}).sort({ name: 1 }).toArray();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Skills
      </h1>
      <p className="mt-2 text-muted">
        Create and edit the skill catalogue used in assessments and gap
        analysis.
      </p>
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
