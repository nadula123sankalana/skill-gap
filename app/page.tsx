import Link from "next/link";
import { SeverityBadge } from "@/components/severity-badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(14, 95, 107, 0.12), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(42, 122, 85, 0.08), transparent)",
        }}
      />

      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          University career readiness
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Internship Skill Gap Assessment &amp; Recommendation
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Measure yourself against industry benchmarks, see clear
          red–yellow–green gaps, and get recommendations that career services
          can actually manage.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/register">Get started as a student</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log in</Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Severity scale
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SeverityBadge severity="RED" />
              <SeverityBadge severity="YELLOW" />
              <SeverityBadge severity="GREEN" />
            </div>
            <p className="mt-3 text-sm text-muted">
              Thresholds are admin-configurable — never hardcoded in the app.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Benchmarks
            </p>
            <p className="mt-3 font-display text-2xl font-semibold text-primary">
              Live from DB
            </p>
            <p className="mt-2 text-sm text-muted">
              Skills, industry scores, and recommendation rules are all editable
              by administrators.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Design tokens
            </p>
            <div className="mt-3 flex gap-2">
              <span
                className="h-8 w-8 rounded-md border border-border"
                style={{ background: "#0E5F6B" }}
                title="primary"
              />
              <span
                className="h-8 w-8 rounded-md border border-border"
                style={{ background: "#F2F5F6" }}
                title="background"
              />
              <span
                className="h-8 w-8 rounded-md border border-border"
                style={{ background: "#C44536" }}
                title="severity-red"
              />
              <span
                className="h-8 w-8 rounded-md border border-border"
                style={{ background: "#C49A1A" }}
                title="severity-yellow"
              />
              <span
                className="h-8 w-8 rounded-md border border-border"
                style={{ background: "#2A7A55" }}
                title="severity-green"
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              See <span className="font-mono text-xs">DESIGN.md</span> for the
              full token rationale.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
