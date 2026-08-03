import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { collections } from "@/lib/mongodb";
import { idStr, oid } from "@/lib/types";
import { ClipboardList } from "lucide-react";
import { AssessmentForm } from "./assessment-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";

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
      <div className="bg-subtle">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <EmptyState
            icon={ClipboardList}
            title="No skills configured yet"
            description="Ask an administrator to add skills in the admin console before you take the assessment."
            action={
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-subtle pb-16">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal
          preset="fade"
          className="noise-overlay relative isolate mb-8 overflow-hidden rounded-3xl bg-mesh-hero px-6 py-8 sm:px-9"
        >
          <div
            className="grid-overlay pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                Step 1 of 2
              </p>
              <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">
                Skill assessment
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
                Rate each skill, or skip any you prefer not to answer. Skipped
                skills are excluded from gap analysis — they are never scored
                as zero.
              </p>
            </div>
            <Button asChild variant="onDark" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </Reveal>

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
    </div>
  );
}
