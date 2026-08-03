import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { collections } from "@/lib/mongodb";
import { idStr, oid, type Severity } from "@/lib/types";
import {
  classifySeverity,
  DEFAULT_BENCHMARK_SECTOR,
} from "@/lib/constants";
import { FALLBACK_MESSAGE } from "@/lib/recommendations";
import { SeverityBadge } from "@/components/severity-badge";
import { GapBarChart } from "@/components/gap-bar-chart";
import { RefreshRecommendationsButton } from "@/components/refresh-recommendations-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

const severityOrder: Record<Severity, number> = {
  RED: 0,
  YELLOW: 1,
  GREEN: 2,
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const c = await collections();
  const studentOid = oid(session.user.id);

  const latest = await c.assessments.findOne(
    { studentId: studentOid, status: "SUBMITTED" },
    { sort: { submittedAt: -1 } }
  );

  if (!latest) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Student dashboard
        </h1>
        <p className="mt-2 text-muted">Welcome, {session.user.name}.</p>
        <div className="mt-8">
          <EmptyState
            icon={ClipboardList}
            title="No assessment yet"
            description="Take the skill assessment to see your gaps against industry benchmarks and get tailored recommendations."
            action={
              <Button asChild>
                <Link href="/dashboard/assessment">Start assessment</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // Live severity reclassification from DB config (proves thresholds aren't hardcoded)
  const severityConfig =
    (await c.severityConfig.findOne({})) ?? {
      greenMaxGap: 10,
      yellowMaxGap: 25,
    };

  const gaps = await c.skillGaps
    .find({ assessmentId: latest._id })
    .toArray();

  // Sync severity if admin changed thresholds since submission
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
  const skillIds = Array.from(
    new Set([
      ...gaps.map((g) => idStr(g.skillId)),
      ...responses.map((r) => idStr(r.skillId)),
    ])
  ).map((id) => oid(id));

  const skills = await c.skills.find({ _id: { $in: skillIds } }).toArray();
  const skillName = new Map(skills.map((s) => [idStr(s._id), s.name]));

  const benchmarks = await c.industryBenchmarks
    .find({ skillId: { $in: skillIds } })
    .toArray();
  const benchBySkill = new Map<string, number>();
  for (const b of benchmarks) {
    const key = idStr(b.skillId);
    if (b.sector === DEFAULT_BENCHMARK_SECTOR || !benchBySkill.has(key)) {
      benchBySkill.set(key, b.requiredScore);
    }
  }
  for (const b of benchmarks) {
    if (b.sector === DEFAULT_BENCHMARK_SECTOR) {
      benchBySkill.set(idStr(b.skillId), b.requiredScore);
    }
  }

  const scoreBySkill = new Map(
    responses.map((r) => [idStr(r.skillId), r.normalizedScore])
  );

  const chartData = gaps
    .map((g) => {
      const sid = idStr(g.skillId);
      return {
        skill: skillName.get(sid) ?? "Skill",
        score: Math.round(scoreBySkill.get(sid) ?? 0),
        benchmark: Math.round(benchBySkill.get(sid) ?? 0),
        severity: g.severity,
      };
    })
    .sort((a, b) => a.skill.localeCompare(b.skill));

  const sortedGaps = [...gaps].sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      b.gapScore - a.gapScore
  );

  const recommendations = await c.recommendations
    .find({ studentId: studentOid })
    .sort({ createdAt: -1 })
    .toArray();

  const rules = await c.recommendationRules
    .find({
      _id: {
        $in: recommendations
          .map((r) => r.ruleId)
          .filter((id): id is NonNullable<typeof id> => id !== null),
      },
    })
    .toArray();
  const ruleById = new Map(rules.map((r) => [idStr(r._id), r]));

  const aiText = recommendations.find((r) => r.aiPersonalizedText)
    ?.aiPersonalizedText;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Student dashboard
          </h1>
          <p className="mt-2 text-muted">
            Welcome, {session.user.name}. Latest assessment submitted{" "}
            {latest.submittedAt
              ? new Date(latest.submittedAt).toLocaleDateString()
              : "recently"}
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/assessment">Retake / new draft</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score vs industry benchmark</CardTitle>
          <CardDescription>
            Bars are color-coded by live severity thresholds (green ≤{" "}
            {severityConfig.greenMaxGap}, yellow ≤ {severityConfig.yellowMaxGap}
            ).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GapBarChart data={chartData} />
        </CardContent>
      </Card>

      <section>
        <h2 className="font-display text-xl font-semibold">Skill gaps</h2>
        <p className="mt-1 text-sm text-muted">
          Sorted critical first. Only skills you rated are included — skipped
          skills do not appear.
        </p>
        <ul className="mt-4 space-y-3">
          {sortedGaps.map((g) => (
            <li
              key={idStr(g._id)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-soft"
            >
              <div>
                <p className="font-medium">
                  {skillName.get(idStr(g.skillId)) ?? "Skill"}
                </p>
                <p className="font-mono text-xs text-muted">
                  Gap score: {g.gapScore.toFixed(1)} · Your score:{" "}
                  {(scoreBySkill.get(idStr(g.skillId)) ?? 0).toFixed(0)} ·
                  Benchmark: {benchBySkill.get(idStr(g.skillId)) ?? "—"}
                </p>
              </div>
              <SeverityBadge severity={g.severity} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Recommendations
            </h2>
            <p className="mt-1 text-sm text-muted">
              Based on RED and YELLOW gaps. Refresh after an admin updates
              rules.
            </p>
          </div>
          <RefreshRecommendationsButton />
        </div>

        {aiText && (
          <Card className="mt-4 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Personalized guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{aiText}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {recommendations.length === 0 && (
            <p className="text-sm text-muted sm:col-span-2">
              No RED or YELLOW gaps — keep building on your strengths, or retake
              the assessment after more practice.
            </p>
          )}
          {recommendations.map((rec) => {
            const rule = rec.ruleId ? ruleById.get(idStr(rec.ruleId)) : null;
            const isFallback = !rec.ruleId;
            return (
              <Card key={idStr(rec._id)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {skillName.get(idStr(rec.skillId)) ?? "Skill"}
                  </CardTitle>
                  <CardDescription>
                    {isFallback
                      ? "Needs admin review"
                      : rule?.resourceType ?? "Resource"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {isFallback ? (
                    <p className="text-muted">{FALLBACK_MESSAGE}</p>
                  ) : (
                    <>
                      <p className="font-medium">{rule?.resourceTitle}</p>
                      {rule?.resourceUrl && (
                        <a
                          href={rule.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Open resource
                        </a>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
