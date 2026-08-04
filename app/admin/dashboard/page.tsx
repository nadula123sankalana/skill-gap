import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import { SeverityBadge } from "@/components/severity-badge";
import { RefreshInsightsButton } from "@/components/refresh-insights-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
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
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Insights"
        title="Cohort dashboard"
        description={`Aggregated readiness across ${submittedCount} submitted assessment${
          submittedCount === 1 ? "" : "s"
        } and ${students.length} student${students.length === 1 ? "" : "s"}.`}
      />

      <StaggerGroup className="grid gap-4 sm:grid-cols-2">
        <StaggerItem>
        <Card className="h-full">
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
              <ul className="space-y-3">
                {avgRows.map((row) => (
                  <li key={row.skillId} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span>{row.name}</span>
                      <span className="font-semibold text-foreground">
                        {row.meanScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                      <div
                        className="h-full rounded-full bg-brand-pill"
                        style={{
                          width: `${Math.max(
                            2,
                            Math.min(100, row.meanScore)
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        </StaggerItem>

        <StaggerItem>
        <Card className="h-full">
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
                    className="flex items-center justify-between gap-3 rounded-xl bg-subtle px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <SeverityBadge severity="RED" showLabel={false} />
                      {row.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerGroup>

      <Reveal>
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-pill px-6 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
              Free-text themes
            </p>
            <RefreshInsightsButton />
          </div>
          <CardContent className="pt-5">
            <CardDescription className="mb-3">
              Rule-based summary of anonymous free-text responses (keyword
              frequency + samples). Cached until you refresh.
            </CardDescription>
            {insight ? (
              <>
                <p className="text-sm leading-relaxed">{insight.summaryText}</p>
                <p className="mt-3 text-xs text-muted">
                  Last refreshed{" "}
                  {new Date(insight.refreshedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                No insights yet. Click &quot;Refresh insights&quot; to generate
                a summary.
              </p>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <section>
        <Reveal>
          <h2 className="font-display text-xl font-medium">Students</h2>
          <p className="mt-1 text-sm text-muted">
            Open a student to see their full gap profile.
          </p>
        </Reveal>
        <StaggerGroup as="ul" className="mt-4 space-y-2.5" stagger={0.04}>
          {studentRows.length === 0 && (
            <StaggerItem
              as="li"
              className="rounded-2xl border border-border bg-white px-5 py-6 text-sm text-muted"
            >
              No student accounts yet.
            </StaggerItem>
          )}
          {studentRows.map((s) => (
            <StaggerItem as="li" key={s.id}>
              <Link
                href={`/admin/students/${s.id}`}
                className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted">{s.email}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {s.hasAssessment ? (
                    <span className="text-xs text-muted">
                      {s.gapCount} gaps · {s.redCount} critical
                    </span>
                  ) : (
                    <span className="rounded-full bg-subtle px-2.5 py-1 text-xs text-muted">
                      No assessment
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-medium text-primary">
                    View
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
}
