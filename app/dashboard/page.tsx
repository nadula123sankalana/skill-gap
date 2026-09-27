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
import { AssessmentPdfReport } from "@/components/assessment-pdf-report";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import {
  SkillGapList,
  type SkillGapRow,
} from "@/components/dashboard/skill-gap-list";
import { readinessBand } from "@/lib/readiness";
import { InternshipMatchPanel } from "@/components/internship-match-panel";
import { matchStudentToRoles } from "@/lib/internship-match";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  FileText,
  RotateCcw,
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

const severityLabel: Record<Severity, string> = {
  RED: "Critical",
  YELLOW: "Moderate",
  GREEN: "On track",
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
            subtitle="Student dashboard"
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

  const guidanceText = recommendations.find((r) => r.aiPersonalizedText)
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
    ? new Date(latest.submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "recently";

  const reportSkills = sortedGaps.map((g) => {
    const sid = idStr(g.skillId);
    return {
      name: skillName.get(sid) ?? "Skill",
      score: scoreBySkill.get(sid) ?? 0,
      benchmark: benchBySkill.get(sid) ?? 0,
      gap: g.gapScore,
      status: severityLabel[g.severity],
      severity: g.severity,
    };
  });

  const reportRecommendations = recommendations.map((rec) => {
    const rule = rec.ruleId ? ruleById.get(idStr(rec.ruleId)) : null;
    return {
      skill: skillName.get(idStr(rec.skillId)) ?? "Skill",
      title: rule?.resourceTitle ?? FALLBACK_MESSAGE,
      url: rule?.resourceUrl ?? null,
    };
  });

  const [allSkills, roleDocs] = await Promise.all([
    c.skills.find({}).project({ name: 1 }).toArray(),
    c.internshipRoles.find({}).sort({ priority: 1, title: 1 }).toArray(),
  ]);
  const skillNameById = new Map(
    allSkills.map((s) => [idStr(s._id), s.name] as const)
  );
  const roleMatches = matchStudentToRoles(
    roleDocs,
    scoreBySkill,
    skillNameById
  );
  const bestRole = [...roleMatches].sort(
    (a, b) => b.matchPercent - a.matchPercent || a.priority - b.priority
  )[0];

  const gapRows: SkillGapRow[] = sortedGaps.map((g) => {
    const sid = idStr(g.skillId);
    return {
      id: idStr(g._id),
      name: skillName.get(sid) ?? "Skill",
      score: scoreBySkill.get(sid) ?? 0,
      benchmark: benchBySkill.get(sid) ?? null,
      gap: g.gapScore,
      severity: g.severity,
    };
  });
  const priorities = gapRows.filter((r) => r.severity !== "GREEN").slice(0, 3);
  const topPriority = priorities[0];

  const severityBySkill = new Map(
    gaps.map((g) => [idStr(g.skillId), g.severity] as const)
  );
  const sortedRecommendations = [...recommendations].sort(
    (a, b) =>
      severityOrder[severityBySkill.get(idStr(a.skillId)) ?? "GREEN"] -
      severityOrder[severityBySkill.get(idStr(b.skillId)) ?? "GREEN"]
  );

  const overview = (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-lg">Priority focus</CardTitle>
              <CardDescription className="mt-1.5">
                The skills furthest from the industry benchmark.
              </CardDescription>
            </div>
            <SectionLink href="#gaps">All skills</SectionLink>
          </CardHeader>
          <CardContent>
            {priorities.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl bg-severity-green/10 px-4 py-4 text-sm text-foreground">
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-severity-green"
                  aria-hidden
                />
                Every skill you rated is on track. Keep practising and retake
                the assessment to confirm your progress.
              </div>
            ) : (
              <ol className="space-y-3">
                {priorities.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-4 rounded-xl border border-border px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate font-medium text-foreground">
                          {p.name}
                        </p>
                        <SeverityBadge severity={p.severity} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Score {Math.round(p.score)} · Benchmark{" "}
                        {p.benchmark === null ? "—" : Math.round(p.benchmark)} ·{" "}
                        <span className="font-semibold text-foreground">
                          {p.gap.toFixed(0)} pts to close
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 font-medium">
                <Briefcase className="h-4 w-4 text-primary" aria-hidden />
                Best internship fit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bestRole ? (
                <>
                  <p className="font-display text-lg font-medium text-foreground">
                    {bestRole.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {bestRole.metCount} of {bestRole.requiredCount} requirements
                    met
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full rounded-full bg-brand-pill"
                      style={{ width: `${Math.max(2, bestRole.matchPercent)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {bestRole.matchPercent}% match · {bestRole.levelLabel}
                  </p>
                  <SectionLink href="#roles" className="mt-4">
                    Compare all roles
                  </SectionLink>
                </>
              ) : (
                <p className="text-sm text-muted">
                  No internship roles are configured yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-primary" aria-hidden />
                Assessment report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                A printable summary of your scores, gaps and focus plan.
              </p>
              <SectionLink href="#report" className="mt-3">
                View &amp; download
              </SectionLink>
            </CardContent>
          </Card>
        </div>
      </div>

      {guidanceText && <FocusPlan text={guidanceText} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score vs industry benchmark</CardTitle>
          <CardDescription>
            Bars are colour-coded by severity: on track within{" "}
            {severityConfig.greenMaxGap} pts, moderate within{" "}
            {severityConfig.yellowMaxGap} pts, critical beyond that.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GapBarChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );

  const gapsTab = (
    <div>
      <SectionIntro
        title="Skill gaps"
        description="Sorted critical first. The marker on each bar shows the industry benchmark. Only skills you rated are included."
      />
      <div className="mt-5">
        <SkillGapList rows={gapRows} />
      </div>
    </div>
  );

  const recommendationsTab = (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionIntro
          title="Recommendations"
          description="Learning resources for your critical and moderate gaps, most urgent first."
        />
        <RefreshRecommendationsButton />
      </div>

      {guidanceText && <FocusPlan text={guidanceText} />}

      {sortedRecommendations.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing to work on right now"
          description="You have no critical or moderate gaps. Keep building on your strengths, or retake the assessment after more practice."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sortedRecommendations.map((rec) => {
            const rule = rec.ruleId ? ruleById.get(idStr(rec.ruleId)) : null;
            const isFallback = !rec.ruleId;
            const severity = severityBySkill.get(idStr(rec.skillId));
            return (
              <Card
                key={idStr(rec._id)}
                interactive={!isFallback}
                className="flex h-full flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {skillName.get(idStr(rec.skillId)) ?? "Skill"}
                    </p>
                    {severity && <SeverityBadge severity={severity} />}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 text-sm">
                  {isFallback ? (
                    <p className="text-muted">{FALLBACK_MESSAGE}</p>
                  ) : (
                    <>
                      <div>
                        <span className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                          {rule?.resourceType ?? "Resource"}
                        </span>
                        <p className="mt-3 font-medium leading-snug text-foreground">
                          {rule?.resourceTitle}
                        </p>
                      </div>
                      {rule?.resourceUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-auto self-start"
                        >
                          <a
                            href={rule.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open resource
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">(opens in new tab)</span>
                          </a>
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-subtle pb-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <DashboardBanner
          name={session.user.name ?? "there"}
          subtitle={`Latest assessment · ${submittedLabel}`}
          readiness={readiness}
          topPriority={topPriority}
        />

        <StaggerGroup className="no-print grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile
            href="#gaps"
            icon={AlertTriangle}
            label="Critical gaps"
            hint={`Over ${severityConfig.yellowMaxGap} pts below`}
            value={counts.red}
            tone="text-severity-red bg-severity-red/10"
          />
          <StatTile
            href="#gaps"
            icon={CircleDot}
            label="Moderate gaps"
            hint={`${severityConfig.greenMaxGap}–${severityConfig.yellowMaxGap} pts below`}
            value={counts.yellow}
            tone="text-severity-yellow bg-severity-yellow/10"
          />
          <StatTile
            href="#gaps"
            icon={CheckCircle2}
            label="On track"
            hint={`Within ${severityConfig.greenMaxGap} pts`}
            value={counts.green}
            tone="text-severity-green bg-severity-green/10"
          />
          <StatTile
            href="#recommendations"
            icon={Sparkles}
            label="Recommendations"
            hint="Resources to close gaps"
            value={recommendations.length}
            tone="text-primary bg-accent"
          />
        </StaggerGroup>

        <DashboardTabs
          tabs={[
            { value: "overview", label: "Overview", content: overview },
            {
              value: "gaps",
              label: "Skill gaps",
              count: gaps.length,
              content: gapsTab,
            },
            {
              value: "recommendations",
              label: "Recommendations",
              count: recommendations.length,
              content: recommendationsTab,
            },
            {
              value: "roles",
              label: "Internship roles",
              count: roleMatches.length,
              content: <InternshipMatchPanel matches={roleMatches} />,
            },
            {
              value: "report",
              label: "Report",
              content: (
                <AssessmentPdfReport
                  studentName={session.user.name ?? "Student"}
                  studentEmail={session.user.email}
                  submittedLabel={submittedLabel}
                  readiness={readiness}
                  counts={counts}
                  skills={reportSkills}
                  guidanceText={guidanceText}
                  recommendations={reportRecommendations}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function DashboardBanner({
  name,
  subtitle,
  readiness,
  topPriority,
}: {
  name: string;
  subtitle: string;
  readiness?: number;
  topPriority?: SkillGapRow;
}) {
  return (
    <Reveal
      preset="fade"
      className="no-print noise-overlay relative isolate overflow-hidden rounded-3xl bg-mesh-hero px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            {subtitle}
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Welcome back, {name}
          </h1>

          {readiness === undefined ? (
            <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
              Take your first assessment to unlock your readiness signal.
            </p>
          ) : topPriority ? (
            <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
              Your top priority is{" "}
              <span className="font-semibold text-white">
                {topPriority.name}
              </span>{" "}
              — {topPriority.gap.toFixed(0)} pts below the industry benchmark.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
              Every skill you rated is at or near the industry benchmark.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {readiness === undefined ? (
              <Button asChild variant="onBrand">
                <Link href="/dashboard/assessment">Start assessment</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="onBrand">
                  <a href="#recommendations">
                    View action plan
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <Button asChild variant="onDark">
                  <Link href="/dashboard/assessment">
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Retake assessment
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {readiness !== undefined && (
          <div className="flex items-center gap-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:p-5">
            <ReadinessRing value={readiness} size={116} />
            <div className="max-w-[13rem]">
              <p className="font-display text-base font-medium text-white">
                Internship readiness
              </p>
              <span className="mt-1.5 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                {readinessBand(readiness)}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-white/75">
                Average of your scores as a share of each skill&apos;s
                benchmark.
              </p>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}

function StatTile({
  href,
  icon: Icon,
  label,
  hint,
  value,
  tone,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint: string;
  value: number;
  tone: string;
}) {
  return (
    <StaggerItem>
      <a
        href={href}
        className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-4 sm:p-5"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${tone}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-medium tabular-nums text-foreground">
            {value}
          </p>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 hidden text-xs text-muted sm:block">{hint}</p>
        </div>
      </a>
    </StaggerItem>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-medium">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
    </div>
  );
}

function SectionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline ${className ?? ""}`}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

function FocusPlan({ text }: { text: string }) {
  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="bg-brand-pill px-6 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4" aria-hidden />
          Your focus plan
        </p>
      </div>
      <CardContent className="pt-5">
        <p className="text-sm leading-relaxed text-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
