import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Layers,
  Lightbulb,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { collections } from "@/lib/mongodb";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const c = await collections();
  const [skillCount, roleCount, benchmarkCount, ruleCount, studentCount] =
    await Promise.all([
      c.skills.countDocuments(),
      c.internshipRoles.countDocuments(),
      c.industryBenchmarks.countDocuments(),
      c.recommendationRules.countDocuments(),
      c.studentProfiles.countDocuments(),
    ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Admin"
        title="Configuration overview"
        description="Manage skills, internship role floors, benchmarks, recommendation rules, and severity thresholds. Nothing is hardcoded in application code — every value lives in MongoDB and is editable here."
      />

      <StaggerGroup className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={Layers}
          title="Skills"
          value={skillCount}
          href="/admin/skills"
          cta="Manage skills"
          hint="Technical and soft skills used in the assessment."
        />
        <StatCard
          icon={Briefcase}
          title="Internship roles"
          value={roleCount}
          href="/admin/roles"
          cta="Manage roles"
          hint="Rule-based skill floors for transparent internship matching."
        />
        <StatCard
          icon={Target}
          title="Benchmarks"
          value={benchmarkCount}
          href="/admin/benchmarks"
          cta="Manage benchmarks"
          hint="Required scores by industry sector."
        />
        <StatCard
          icon={Lightbulb}
          title="Recommendation rules"
          value={ruleCount}
          href="/admin/rules"
          cta="Manage rules"
          hint="Resources matched to critical and moderate gaps."
        />
        <StatCard
          icon={Users}
          title="Registered students"
          value={studentCount}
          href="/admin/dashboard"
          cta="Open cohort dashboard"
          hint="Aggregates, critical-gap rankings, and free-text insights."
        />
      </StaggerGroup>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  href,
  cta,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  value: number;
  href: string;
  cta: string;
  hint: string;
}) {
  return (
    <StaggerItem>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-muted transition-colors group-hover:text-primary"
            aria-hidden
          />
        </div>
        <p className="mt-5 font-display text-4xl font-medium text-foreground">
          <CountUp to={value} />
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{hint}</p>
        <span className="mt-4 text-sm font-medium text-primary">{cta}</span>
      </Link>
    </StaggerItem>
  );
}
