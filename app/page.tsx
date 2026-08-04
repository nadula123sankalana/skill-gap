import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Gauge,
  Layers,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Float } from "@/components/motion/float";
import { CountUp } from "@/components/motion/count-up";
import { Magnetic } from "@/components/motion/magnetic";
import { WordReveal } from "@/components/motion/word-reveal";
import { AssessmentMockup, ReportMockup } from "@/components/home/mockups";
import { Faq } from "@/components/home/faq";

export const dynamic = "force-dynamic";

const frameworks = [
  "Technical skills",
  "Soft skills",
  "Data & analytics",
  "Cloud & DevOps",
  "Communication",
];

const valueProps = [
  {
    icon: Layers,
    title: "One place for readiness",
    body: "Self-assessment, benchmark comparison, gap severity, and learning recommendations live in a single workflow instead of scattered spreadsheets.",
  },
  {
    icon: ShieldCheck,
    title: "No guesswork scoring",
    body: "Gaps are measured against benchmarks your career services team maintains, so every result traces back to a documented, editable standard.",
  },
  {
    icon: Sparkles,
    title: "Action, not just a score",
    body: "Each critical and moderate gap is matched to concrete courses, workshops, and projects — with optional AI guidance layered on top.",
  },
];

const steps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Complete your self-assessment",
    body: "Rate yourself across the technical and soft skills used in real internship roles. Skip anything you are unsure about — skipped skills are never treated as zero.",
  },
  {
    step: "02",
    icon: Gauge,
    title: "See industry-aligned gaps",
    body: "Your scores are compared to live industry benchmarks and classified Critical, Moderate, or On track using admin-configured thresholds.",
  },
  {
    step: "03",
    icon: Lightbulb,
    title: "Follow a clear action plan",
    body: "Receive prioritized courses, workshops, and projects matched to your largest gaps, so you know exactly what to improve before applications open.",
  },
];

const outcomes = [
  { value: 3, suffix: " min", label: "To your first readiness signal" },
  { value: 100, suffix: "%", label: "Database-backed, admin-configurable" },
  { value: 12, suffix: "+", label: "Skills tracked across every cohort" },
];

export default function HomePage() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="noise-overlay relative isolate overflow-hidden bg-mesh-hero">
        <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 text-center sm:px-6 sm:pb-32 sm:pt-20">
          <Reveal preset="fade">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur">
              <Target className="h-4 w-4" aria-hidden />
              University career readiness
            </span>
          </Reveal>

          <h1 className="mx-auto mt-8 max-w-5xl font-display text-5xl font-light leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <WordReveal text="Assess, Advance, Achieve: Your" />
            <br />
            <WordReveal text="Path to Internship Readiness" delay={0.35} />
          </h1>

          <Reveal preset="up" delay={0.5}>
            <p className="mx-auto mt-7 max-w-3xl text-lg font-light leading-relaxed text-white/90 sm:text-xl">
              Measure your skills against live industry benchmarks, see exactly
              where the critical gaps are, and get a prioritized plan built from
              resources your university actually recommends.
            </p>
          </Reveal>

          <Reveal preset="up" delay={0.65}>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Magnetic>
                <Button asChild size="xl" variant="default" className="min-w-[14rem] text-base font-medium">
                  <Link href="/register">
                    Start free assessment
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild size="xl" variant="onBrand" className="min-w-[10rem] text-base font-medium">
                  <Link href="/login">Sign in</Link>
                </Button>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal preset="fade" delay={0.8}>
            <p className="mt-8 text-base font-light text-white/75">
              Free for students · No credit card · Results in minutes
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2 — Dark band: coverage strip + value props */}
      <section id="why" className="relative bg-ink-band">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerGroup
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-b border-white/10 py-8"
            stagger={0.07}
          >
            {frameworks.map((item) => (
              <StaggerItem
                key={item}
                preset="fade"
                className="text-sm font-medium uppercase tracking-[0.14em] text-white/40"
              >
                {item}
              </StaggerItem>
            ))}
          </StaggerGroup>

          <StaggerGroup className="grid gap-10 py-16 text-center sm:py-20 md:grid-cols-3 md:gap-8">
            {valueProps.map((item) => (
              <StaggerItem key={item.title} className="flex flex-col items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-teal-light ring-1 ring-white/15">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-medium text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 3 — How it works */}
      <section id="how-it-works" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
              How it works
            </span>
            <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              From self-assessment to an action plan in three steps
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              The whole loop takes minutes, and every step is driven by
              configuration your career services team controls.
            </p>
          </Reveal>

          <StaggerGroup
            as="ol"
            className="mt-14 grid gap-6 md:grid-cols-3"
            stagger={0.12}
          >
            {steps.map((item) => (
              <StaggerItem as="li" key={item.step}>
                <Magnetic className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-7 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-pill text-white shadow-glow">
                        <item.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="font-display text-2xl font-medium text-accent-foreground/15">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </Magnetic>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 4 — Feature A: assessment */}
      <section id="capabilities" className="bg-subtle py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <Reveal preset="left" className="relative order-2 lg:order-1">
            <div className="pointer-events-none absolute -left-4 -top-5 z-10 hidden sm:block">
              <Float delay={0.2} duration={6}>
                <TagPill label="Technical" tone="bg-[#E4ECFF] text-brand-blue" />
              </Float>
            </div>
            <div className="pointer-events-none absolute -right-3 top-16 z-10 hidden sm:block">
              <Float delay={0.4} duration={7} reverse>
                <TagPill label="Soft skills" tone="bg-[#E6F8F2] text-brand-teal-dark" />
              </Float>
            </div>
            <div className="pointer-events-none absolute -left-6 bottom-10 z-10 hidden sm:block">
              <Float delay={0.6} duration={8} reverse>
                <TagPill label="Skip allowed" tone="bg-[#F1EBFF] text-brand-violet" />
              </Float>
            </div>
            <div className="pointer-events-none absolute -right-5 -bottom-4 z-10 hidden sm:block">
              <Float delay={0.75} duration={6.5}>
                <TagPill label="Autosaved" tone="bg-[#FFF3DA] text-[#B57816]" />
              </Float>
            </div>
            <AssessmentMockup />
          </Reveal>

          <Reveal preset="right" className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-[#FFF3DA] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#B57816]">
              Guided assessment
            </span>
            <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-foreground sm:text-[2.1rem]">
              Rate your skills once, without the busywork
            </h2>

            <StaggerGroup className="mt-8 space-y-7" delay={0.15}>
              <FeaturePoint
                icon={BookOpenCheck}
                title="Questions built from your institution's framework"
                body="Every skill comes from the database, so the assessment always reflects the current readiness framework rather than a fixed question list."
              />
              <FeaturePoint
                icon={ClipboardList}
                title="Save a draft and finish later"
                body="Progress is stored as you go and skipped skills stay skipped, so partial answers never distort your score."
              />
            </StaggerGroup>

            <div className="mt-9">
              <Magnetic className="inline-block">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start your assessment
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — Feature B: report */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <Reveal preset="left">
            <span className="inline-flex rounded-full bg-[#E6F8F2] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-teal-dark">
              Gap reporting
            </span>
            <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-foreground sm:text-[2.1rem]">
              See the gap, its severity, and what to do next
            </h2>

            <StaggerGroup className="mt-8 space-y-7" delay={0.15}>
              <FeaturePoint
                icon={BarChart3}
                title="Severity you can read at a glance"
                body="Critical, moderate, and on-track skills are colour-coded against live thresholds, and reclassify automatically whenever an administrator adjusts them."
              />
              <FeaturePoint
                icon={Lightbulb}
                title="Recommendations tied to real resources"
                body="Rules map each gap to courses, workshops, and projects your institution curates, so the next step is always concrete."
              />
            </StaggerGroup>

            <div className="mt-9">
              <Magnetic className="inline-block">
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">
                    View a dashboard
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal preset="right" className="relative">
            <div className="pointer-events-none absolute -left-5 top-8 z-10 hidden sm:block">
              <Float delay={0.3} duration={7}>
                <TagPill label="Critical" tone="bg-severity-red/12 text-severity-red" />
              </Float>
            </div>
            <div className="pointer-events-none absolute -right-4 top-1/3 z-10 hidden sm:block">
              <Float delay={0.5} duration={8} reverse>
                <TagPill label="Moderate" tone="bg-severity-yellow/12 text-severity-yellow" />
              </Float>
            </div>
            <div className="pointer-events-none absolute -left-4 -bottom-4 z-10 hidden sm:block">
              <Float delay={0.7} duration={6.5} reverse>
                <TagPill label="On track" tone="bg-severity-green/12 text-severity-green" />
              </Float>
            </div>
            <ReportMockup />
          </Reveal>
        </div>
      </section>

      {/* 6 — Outcomes band */}
      <section id="outcomes" className="bg-brand-band">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <StaggerGroup className="grid gap-10 sm:grid-cols-3 sm:gap-0">
            {outcomes.map((item, i) => (
              <StaggerItem
                key={item.label}
                className={`text-center ${
                  i > 0 ? "sm:border-l sm:border-white/25" : ""
                }`}
              >
                <p className="font-display text-4xl font-medium text-white sm:text-5xl">
                  <CountUp to={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-white/85">
                  {item.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="mt-12 flex justify-center" delay={0.2}>
            <Magnetic>
              <Button asChild size="lg" variant="onBrand">
                <Link href="/register">Create your free account</Link>
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* 7 — FAQ */}
      <section id="faq" className="bg-subtle py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
              FAQ
            </span>
            <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Questions students ask first
            </h2>
          </Reveal>
          <Faq />
        </div>
      </section>

      {/* 8 — Final CTA */}
      <section className="bg-brand-band">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Explore your internship journey with confidence
            </h2>
            <p className="mt-4 text-base text-white/85">
              Get started for free — no credit card, no setup, just a clear
              picture of where you stand.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Button asChild size="lg" variant="onBrand">
                  <Link href="/register">Create student account</Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild size="lg" variant="onDark">
                  <Link href="/login">Sign in</Link>
                </Button>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function TagPill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium shadow-soft ring-1 ring-black/5 ${tone}`}
    >
      {label}
    </span>
  );
}

function FeaturePoint({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <StaggerItem className="flex gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-display text-base font-medium text-foreground">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </StaggerItem>
  );
}
