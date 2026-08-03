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
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">← Cohort</Link>
        </Button>
        <h1 className="mt-6 font-display text-3xl font-semibold">
          {student.name}
        </h1>
        <p className="mt-2 text-muted">{student.email}</p>
        <p className="mt-6 text-sm text-muted">
          This student has not submitted an assessment yet.
        </p>
      </div>
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
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">← Cohort</Link>
        </Button>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          {student.name}
        </h1>
        <p className="mt-1 text-muted">{student.email}</p>
        {profile && (
          <p className="mt-1 text-sm text-muted">
            {profile.degreeProgram} · Year {profile.year} · {profile.university}
          </p>
        )}
      </div>

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

      <ul className="space-y-3">
        {sortedGaps.map((g) => (
          <li
            key={idStr(g._id)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {skillName.get(idStr(g.skillId)) ?? "Skill"}
              </p>
              <p className="font-mono text-xs text-muted">
                Gap {g.gapScore.toFixed(1)}
              </p>
            </div>
            <SeverityBadge severity={g.severity} />
          </li>
        ))}
      </ul>

      {freeTexts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Free-text responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {freeTexts.map((t) => (
              <div key={idStr(t._id)}>
                <p className="font-mono text-xs uppercase text-muted">
                  {t.questionKey}
                </p>
                <p className="mt-1 text-sm">{t.responseText}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
