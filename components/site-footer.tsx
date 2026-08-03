"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Activity, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";

const institutionLinks = [
  "Career services configuration",
  "Cohort readiness insights",
  "Industry benchmark management",
  "Recommendation rule library",
];

export function SiteFooter() {
  const { data: session } = useSession();

  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user
        ? "/dashboard"
        : "/login";

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal className="rounded-3xl bg-brand-teal/10 px-6 py-7 ring-1 ring-brand-teal/20 sm:px-10">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal-dark text-white">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-medium text-foreground">
                  Ready to measure your internship readiness?
                </p>
                <p className="mt-1 text-sm text-muted">
                  Create a free student account and finish your first
                  assessment in under ten minutes.
                </p>
              </div>
            </div>
            <Button asChild variant="teal" className="shrink-0">
              <Link href="/register">
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-pill text-white">
                <Activity className="h-4 w-4" aria-hidden />
              </span>
              <span className="font-display text-lg font-medium tracking-tight text-foreground">
                SkillGap
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Internship skill gap assessment and recommendation system for
              university career readiness programs.
            </p>
          </StaggerItem>

          <StaggerItem>
            <p className="text-sm font-semibold text-foreground">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/register"
                  className="text-muted transition-colors hover:text-primary"
                >
                  Student registration
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted transition-colors hover:text-primary"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href={dashboardHref}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {session?.user?.role === "ADMIN"
                    ? "Admin console"
                    : "Dashboard"}
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-muted transition-colors hover:text-primary"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </StaggerItem>

          <StaggerItem>
            <p className="text-sm font-semibold text-foreground">
              For institutions
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {institutionLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <p className="text-sm font-semibold text-foreground">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>career.services@university.edu</li>
              <li>Research project deliverable</li>
              <li>Documentation in project README</li>
            </ul>
          </StaggerItem>
        </StaggerGroup>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SkillGap Assess. All rights reserved.
          </p>
          <p>Built for university internship readiness research.</p>
        </div>
      </div>
    </footer>
  );
}
