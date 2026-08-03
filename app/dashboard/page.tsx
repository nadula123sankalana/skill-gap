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
import { ReadinessRing } from "@/components/dashboard/readiness-ring";
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
import {
  ArrowUpRight,
  ClipboardList,
  Sparkles,
  type LucideIcon,
  AlertTriangle,
  CircleDot,
  CheckCircle2,
} from "lucide-react";

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
      <div className="bg-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <DashboardBanner
            name={session.user.name ?? "there"}
            subtitle="Take your first assessment to unlock your readiness signal."
          />
          <div className="mt-8">
            <EmptyState
              icon={ClipboardList}
              title="No assessment yet"
              description="Take the skill assessment to see your gaps against industry benchmarks and get tailored recommendations."
              action={
                <Button asChild size="lg">
                  <Link href="/dashboard/assessment">Start assessment</Link>
                </Button>
              }
            />
          </div>
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

  const counts = {
    red: gaps.filter((g) => g.severity === "RED").length,
    yellow: gaps.filter((g) => g.severity === "YELLOW").length,
    green: gaps.filter((g) => g.severity === "GREEN").length,
  };

  // Readiness is the mean of each skill's score as a share of its benchmark.
  const ratios = gaps.map((g) => {
    const sid = idStr(g.skillId);
    const score = scoreBySkill.get(sid) ?? 0;
    const bench = benchBySkill.get(sid) ?? 0;
    if (bench <= 0) return 1;
    return Math.min(1, score / bench);
  });
  const readiness =
    ratios.length > 0
      ? (ratios.reduce((sum, r) => sum + r, 0) / ratios.length) * 100
      : 0;

  const submittedLabel = latest.submittedAt
    ? new Date(latest.submittedAt).toLocaleDateString()
    : "recently";

  return (
    <div className="bg-subtle pb-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <DashboardBanner
          name={session.user.name ?? "there"}
          subtitle={`Latest assessment submitted ${submittedLabel}.`}
          readiness={readiness}
          counts={counts}
        />

        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={AlertTriangle}
            label="Critical gaps"
            value={counts.red}
            tone="text-severity-red bg-severity-red/10"
          />
          <StatTile
            icon={CircleDot}
            label="Moderate gaps"
            value={counts.yellow}
            tone="text-severity-yellow bg-severity-yellow/10"
          />
          <StatTile
            icon={CheckCircle2}
            label="On track"
            value={counts.green}
            tone="text-severity-green bg-severity-green/10"
          />
          <StatTile
            icon={Sparkles}
            label="Recommendations"
            value={recommendations.length}
            tone="text-primary bg-accent"
          />
        </StaggerGroup>

        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Score vs industry benchmark
              </CardTitle>
              <CardDescription>
                Bars are colour-coded by live severity thresholds (green ≤{" "}
                {severityConfig.greenMaxGap}, yellow ≤{" "}
                {severityConfig.yellowMaxGap}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GapBarChart data={chartData} />
            </CardContent>
          </Card>
        </Reveal>

        <section>
          <Reveal>
            <h2 className="font-display text-xl font-medium">Skill gaps</h2>
            <p className="mt-1 text-sm text-muted">
              Sorted critical first. Only skills you rated are included —
              skipped skills do not appear.
            </p>
          </Reveal>

          <StaggerGroup as="ul" className="mt-5 space-y-3" stagger={0.05}>
            {sortedGaps.map((g) => {
              const sid = idStr(g.skillId);
              const score = scoreBySkill.get(sid) ?? 0;
              const bench = benchBySkill.get(sid);
              return (
                <StaggerItem
                  as="li"
                  key={idStr(g._id)}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-medium text-foreground">
                      {skillName.get(sid) ?? "Skill"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Gap score {g.gapScore.toFixed(1)} · Your score{" "}
                      {score.toFixed(0)} · Benchmark {bench ?? "—"}
                    </p>
                    <div className="mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-accent">
                      <div
                        className={`h-full rounded-full ${
                          g.severity === "RED"
                            ? "bg-severity-red"
                            : g.severity === "YELLOW"
                              ? "bg-severity-yellow"
                              : "bg-severity-green"
                        }`}
                        style={{
                          width: `${Math.max(4, Math.min(100, score))}%`,
                        }}
                      />
                    </div>
                  </div>
                  <SeverityBadge severity={g.severity} />
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>

        <section>
          <Reveal className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-medium">
                Recommendations
              </h2>
              <p className="mt-1 text-sm text-muted">
                Based on critical and moderate gaps. Refresh after an admin
                updates rules.
              </p>
            </div>
            <RefreshRecommendationsButton />
          </Reveal>

          {aiText && (
            <Reveal className="mt-5">
              <Card className="overflow-hidden border-primary/20">
                <div className="bg-brand-pill px-6 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Personalized guidance
                  </p>
                </div>
                <CardContent className="pt-5">
                  <p className="text-sm leading-relaxed text-foreground">
                    {aiText}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          )}

          <StaggerGroup className="mt-5 grid gap-4 sm:grid-cols-2">
            {recommendations.length === 0 && (
              <StaggerItem className="sm:col-span-2">
                <p className="text-sm text-muted">
                  No critical or moderate gaps — keep building on your
                  strengths, or retake the assessment after more practice.
                </p>
              </StaggerItem>
            )}
            {recommendations.map((rec) => {
              const rule = rec.ruleId ? ruleById.get(idStr(rec.ruleId)) : null;
              const isFallback = !rec.ruleId;
              return (
                <StaggerItem key={idStr(rec._id)}>
                  <Card interactive className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">
                          {skillName.get(idStr(rec.skillId)) ?? "Skill"}
                        </CardTitle>
                        <span className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                          {isFallback
                            ? "Needs admin review"
                            : (rule?.resourceType ?? "Resource")}
                        </span>
                      </div>
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
                              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                              Open resource
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            </a>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>
      </div>
    </div>
  );
}

function DashboardBanner({
  name,
  subtitle,
  readiness,
  counts,
}: {
  name: string;
  subtitle: string;
  readiness?: number;
  counts?: { red: number; yellow: number; green: number };
}) {
  return (
    <Reveal
      preset="fade"
      className="noise-overlay relative isolate overflow-hidden rounded-3xl bg-mesh-hero px-6 py-9 sm:px-10 sm:py-11"
    >
      <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-8">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            Student dashboard
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Welcome back, {name}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/80">{subtitle}</p>
          {counts && (
            <p className="mt-4 text-sm text-white/80">
              {counts.red} critical · {counts.yellow} moderate · {counts.green}{" "}
              on track
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="onBrand">
              <Link href="/dashboard/assessment">
                {readiness === undefined
                  ? "Start assessment"
                  : "Retake assessment"}
              </Link>
            </Button>
          </div>
        </div>

        {readiness !== undefined && (
          <div className="flex items-center gap-5">
            <ReadinessRing value={readiness} />
            <div className="hidden max-w-[12rem] sm:block">
              <p className="font-display text-base font-medium text-white">
                Internship readiness
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                Your average score as a share of the benchmark for every skill
                you rated.
              </p>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <StaggerItem>
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="font-display text-2xl font-medium text-foreground">
            {value}
          </p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </div>
    </StaggerItem>
  );
}
