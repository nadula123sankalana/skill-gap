import Link from "next/link";
import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { SeverityBadge } from "@/components/severity-badge";
import { RefreshInsightsButton } from "@/components/refresh-insights-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminCohortDashboardPage() {
  const c = await collections();

  const [summaries, skills, redGaps, students, insight, submittedCount] =
    await Promise.all([
      c.cohortSummaries.find({}).toArray(),
      c.skills.find({}).toArray(),
      c.skillGaps.find({ severity: "RED" }).toArray(),
      c.users.find({ role: "STUDENT" }).project({ name: 1, email: 1 }).toArray(),
      c.adminInsights.findOne({}),
      c.assessments.countDocuments({ status: "SUBMITTED" }),
    ]);

  const skillName = new Map(skills.map((s) => [idStr(s._id), s.name]));

  const avgRows = summaries
    .map((s) => ({
      skillId: idStr(s.skillId),
      name: skillName.get(idStr(s.skillId)) ?? "Skill",
      meanScore: s.meanScore,
      computedAt: s.computedAt,
    }))
    .sort((a, b) => a.meanScore - b.meanScore);

  const redCounts = new Map<string, number>();
  for (const g of redGaps) {
    const key = idStr(g.skillId);
    redCounts.set(key, (redCounts.get(key) ?? 0) + 1);
  }
  const redRanked = Array.from(redCounts.entries())
    .map(([skillId, count]) => ({
      skillId,
      name: skillName.get(skillId) ?? "Skill",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Latest submitted assessment per student for drill-down list
  const studentRows = await Promise.all(
    students.map(async (u) => {
      const latest = await c.assessments.findOne(
        { studentId: u._id, status: "SUBMITTED" },
        { sort: { submittedAt: -1 } }
      );
      const gapCount = latest
        ? await c.skillGaps.countDocuments({ assessmentId: latest._id })
        : 0;
      const redCount = latest
        ? await c.skillGaps.countDocuments({
            assessmentId: latest._id,
            severity: "RED",
          })
        : 0;
      return {
        id: idStr(u._id),
        name: u.name,
        email: u.email,
        hasAssessment: !!latest,
        gapCount,
        redCount,
      };
    })
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Cohort dashboard
        </h1>
        <p className="mt-2 text-muted">
          Aggregated readiness across {submittedCount} submitted assessment
          {submittedCount === 1 ? "" : "s"} and {students.length} student
          {students.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average score by skill</CardTitle>
            <CardDescription>
              Lowest averages first — where the cohort needs the most support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {avgRows.length === 0 ? (
              <p className="text-sm text-muted">
                No cohort data yet. Students need to submit assessments.
              </p>
            ) : (
              <ul className="space-y-2">
                {avgRows.map((row) => (
                  <li
                    key={row.skillId}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>{row.name}</span>
                    <span className="font-mono text-muted">
                      {row.meanScore.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most common RED skills</CardTitle>
            <CardDescription>
              Count of RED gap records across all students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {redRanked.length === 0 ? (
              <p className="text-sm text-muted">No RED gaps recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {redRanked.map((row) => (
                  <li
                    key={row.skillId}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <SeverityBadge severity="RED" showLabel={false} />
                      {row.name}
                    </span>
                    <span className="font-mono text-muted">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-lg">Free-text themes</CardTitle>
            <CardDescription>
              Gemini summary of anonymous free-text responses. Cached until you
              refresh.
            </CardDescription>
          </div>
          <RefreshInsightsButton />
        </CardHeader>
        <CardContent>
          {insight ? (
            <>
              <p className="text-sm leading-relaxed">{insight.summaryText}</p>
              <p className="mt-3 font-mono text-xs text-muted">
                Last refreshed{" "}
                {new Date(insight.refreshedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              No insights yet. Click &quot;Refresh insights&quot; to generate a
              summary.
            </p>
          )}
        </CardContent>
      </Card>

      <section>
        <h2 className="font-display text-xl font-semibold">Students</h2>
        <p className="mt-1 text-sm text-muted">
          Open a student to see their full gap profile.
        </p>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
          {studentRows.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted">
              No student accounts yet.
            </li>
          )}
          {studentRows.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted">{s.email}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {s.hasAssessment ? (
                  <span className="font-mono text-xs text-muted">
                    {s.gapCount} gaps · {s.redCount} RED
                  </span>
                ) : (
                  <span className="text-xs text-muted">No assessment</span>
                )}
                <Link
                  href={`/admin/students/${s.id}`}
                  className="text-primary hover:underline"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
