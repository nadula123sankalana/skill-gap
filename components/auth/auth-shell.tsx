import Link from "next/link";
import { Activity, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Float } from "@/components/motion/float";
import { SkillPill } from "@/components/home/skill-pill";

/** Split gradient/form layout shared by the login and register screens. */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  bullets,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.2fr_0.8fr]">
      <aside className="noise-overlay relative isolate hidden overflow-hidden bg-mesh-hero px-10 py-16 lg:flex lg:flex-col lg:items-start lg:justify-center xl:px-16">
        <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <Float className="absolute right-6 top-[12%]" delay={0.3} duration={7}>
            <SkillPill
              skill="Cloud fundamentals"
              category="Critical gap"
              match={38}
              initials="Cl"
              accent="violet"
            />
          </Float>
          <Float
            className="absolute right-8 bottom-[14%]"
            delay={0.55}
            duration={8}
            reverse
          >
            <SkillPill
              skill="Version control"
              category="On track"
              match={82}
              initials="Git"
              accent="teal"
            />
          </Float>
        </div>

        <div className="relative my-auto max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30">
              <Activity className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-xl font-medium text-white">
              SkillGap
            </span>
          </Link>

          <Reveal className="mt-10">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
              {eyebrow}
            </p>
            <h2 className="mt-5 font-display text-3xl font-medium leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
              {title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/85 xl:text-lg">
              {subtitle}
            </p>
          </Reveal>

          <StaggerGroup as="ul" className="mt-10 space-y-4" delay={0.25}>
            {bullets.map((bullet) => (
              <StaggerItem
                as="li"
                key={bullet}
                className="flex items-start gap-3 text-base text-white/90"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                </span>
                {bullet}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </aside>

      <div className="flex items-center justify-center bg-white px-5 py-14 sm:px-8 lg:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
