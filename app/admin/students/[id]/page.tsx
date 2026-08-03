import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { collections } from "@/lib/mongodb";
import { idStr, oid, type Severity } from "@/lib/types";
import {
  classifySeverity,
  DEFAULT_BENCHMARK_SECTOR,
} from "@/lib/constants";
import { SeverityBadge } from "@/components/severity-badge";
import { GapBarChart } from "@/components/gap-bar-chart";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const severityOrder: Record<Severity, number> = {
  RED: 0,
  YELLOW: 1,
  GREEN: 2,
};

export default async function AdminStudentDrilldownPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  if (!ObjectId.isValid(params.id)) {
    notFound();
  }

  const c = await collections();
  const student = await c.users.findOne({
    _id: oid(params.id),
    role: "STUDENT",
  });
  if (!student) notFound();

  const profile = await c.studentProfiles.findOne({ userId: student._id });
  const latest = await c.assessments.findOne(
    { studentId: student._id, status: "SUBMITTED" },
    { sort: { submittedAt: -1 } }
  );

  const severityConfig =
    (await c.severityConfig.findOne({})) ?? {
      greenMaxGap: 10,
      yellowMaxGap: 25,
    };

  if (!latest) {
    return (
      <AdminPageHeader
        eyebrow="Student"
        title={student.name}
        description={`${student.email} — this student has not submitted an assessment yet.`}
        action={
          <Button asChild variant="onDark" size="sm">
            <Link href="/admin/dashboard">Back to cohort</Link>
          </Button>
        }
      />
    );
  }

  const gaps = await c.skillGaps.find({ assessmentId: latest._id }).toArray();
  for (const gap of gaps) {
    const next = classifySeverity(
      gap.gapScore,
      severityConfig.greenMaxGap,
      severityConfig.yellowMaxGap
    );
    if (next !== gap.severity) {
      await c.skillGaps.updateOne(
        { _id: gap._id },
        { $set: { severity: next } }
      );
      gap.severity = next;
    }
  }

  const responses = await c.assessmentResponses
    .find({ assessmentId: latest._id })
    .toArray();
  const freeTexts = await c.assessmentFreeTextResponses
    .find({ assessmentId: latest._id })
    .toArray();

  const skillIds = gaps.map((g) => g.skillId);
  const skills = await c.skills.find({ _id: { $in: skillIds } }).toArray();
  const skillName = new Map(skills.map((s) => [idStr(s._id), s.name]));

  const benchmarks = await c.industryBenchmarks
    .find({ skillId: { $in: skillIds } })
    .toArray();
  const benchBySkill = new Map<string, number>();
  for (const b of benchmarks) {
    if (b.sector === DEFAULT_BENCHMARK_SECTOR || !benchBySkill.has(idStr(b.skillId))) {
      benchBySkill.set(idStr(b.skillId), b.requiredScore);
    }
  }

  const scoreBySkill = new Map(
    responses.map((r) => [idStr(r.skillId), r.normalizedScore])
  );

  const chartData = gaps.map((g) => {
    const sid = idStr(g.skillId);
    return {
      skill: skillName.get(sid) ?? "Skill",
      score: Math.round(scoreBySkill.get(sid) ?? 0),
      benchmark: Math.round(benchBySkill.get(sid) ?? 0),
      severity: g.severity,
    };
  });

  const sortedGaps = [...gaps].sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      b.gapScore - a.gapScore
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Student"
        title={student.name}
        description={
          profile
            ? `${student.email} · ${profile.degreeProgram} · Year ${profile.year} · ${profile.university}`
            : student.email
        }
        action={
          <Button asChild variant="onDark" size="sm">
            <Link href="/admin/dashboard">Back to cohort</Link>
          </Button>
        }
      />

      <Reveal>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gap profile</CardTitle>
          <CardDescription>
            Submitted{" "}
            {latest.submittedAt
              ? new Date(latest.submittedAt).toLocaleString()
              : "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GapBarChart data={chartData} />
        </CardContent>
      </Card>
      </Reveal>

      <StaggerGroup as="ul" className="space-y-2.5" stagger={0.04}>
        {sortedGaps.map((g) => (
          <StaggerItem
            as="li"
            key={idStr(g._id)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-soft"
          >
            <div>
              <p className="font-semibold text-foreground">
                {skillName.get(idStr(g.skillId)) ?? "Skill"}
              </p>
              <p className="text-xs text-muted">
                Gap {g.gapScore.toFixed(1)}
              </p>
            </div>
            <SeverityBadge severity={g.severity} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {freeTexts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Free-text responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {freeTexts.map((t) => (
              <div key={idStr(t._id)} className="rounded-xl bg-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  {t.questionKey.replace(/_/g, " ")}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{t.responseText}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
