import { collections } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const c = await collections();
  const [skillCount, benchmarkCount, ruleCount] = await Promise.all([
    c.skills.countDocuments(),
    c.industryBenchmarks.countDocuments(),
    c.recommendationRules.countDocuments(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Admin overview
      </h1>
      <p className="mt-2 text-muted">
        Manage skills, benchmarks, recommendation rules, and severity thresholds
        — nothing is hardcoded in application code. Data lives in MongoDB.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard title="Skills" value={skillCount} href="/admin/skills" />
        <StatCard
          title="Benchmarks"
          value={benchmarkCount}
          href="/admin/benchmarks"
        />
        <StatCard
          title="Recommendation rules"
          value={ruleCount}
          href="/admin/rules"
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted">
              Cohort view
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">
              Aggregates, RED rankings, and free-text insights.
            </p>
            <Link
              href="/admin/dashboard"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Open cohort dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold">{value}</p>
        <Link
          href={href}
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          Manage
        </Link>
      </CardContent>
    </Card>
  );
}
