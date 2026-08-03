import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { collections } from "@/lib/mongodb";
import { idStr, oid } from "@/lib/types";
import { AssessmentForm } from "./assessment-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AssessmentPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const c = await collections();
  const skills = await c.skills.find({}).sort({ category: 1, name: 1 }).toArray();
  const studentOid = oid(session.user.id);

  const draft = await c.assessments.findOne(
    { studentId: studentOid, status: "DRAFT" },
    { sort: { createdAt: -1 } }
  );

  const ratings: Record<string, string> = {};
  const freeText: Record<string, string> = {};

  if (draft) {
    const responses = await c.assessmentResponses
      .find({ assessmentId: draft._id })
      .toArray();
    for (const r of responses) {
      ratings[idStr(r.skillId)] = String(r.rawRating);
    }
    const texts = await c.assessmentFreeTextResponses
      .find({ assessmentId: draft._id })
      .toArray();
    for (const t of texts) {
      freeText[t.questionKey] = t.responseText;
    }
  }

  if (skills.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Assessment</h1>
        <p className="mt-3 text-muted">
          No skills are configured yet. Ask an administrator to add skills
          before you take the assessment.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Skill assessment
          </h1>
          <p className="mt-2 text-muted">
            Rate each skill, or skip any you prefer not to answer. Skipped
            skills are excluded from gap analysis — they are never scored as
            zero.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <AssessmentForm
        skills={skills.map((s) => ({
          id: idStr(s._id),
          name: s.name,
          category: s.category,
          description: s.description,
        }))}
        draft={{
          assessmentId: draft ? idStr(draft._id) : null,
          ratings,
          freeText,
        }}
      />
    </div>
  );
}
