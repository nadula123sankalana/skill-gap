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
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="noise-overlay relative isolate hidden overflow-hidden bg-mesh-hero px-10 py-16 lg:flex lg:flex-col lg:justify-center xl:px-16">
        <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />

        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Float className="absolute right-[-3rem] top-[12%]" delay={0.3} duration={7}>
            <SkillPill
              skill="Cloud fundamentals"
              category="Critical gap"
              match={38}
              initials="Cl"
              accent="violet"
            />
          </Float>
          <Float
            className="absolute right-[-2rem] bottom-[14%]"
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

        <div className="relative max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30">
              <Activity className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-display text-lg font-medium text-white">
              SkillGap
            </span>
          </Link>

          <Reveal className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-display text-[2.1rem] font-medium leading-tight tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              {subtitle}
            </p>
          </Reveal>

          <StaggerGroup as="ul" className="mt-9 space-y-3.5" delay={0.25}>
            {bullets.map((bullet) => (
              <StaggerItem
                as="li"
                key={bullet}
                className="flex items-start gap-3 text-sm text-white/85"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <Check className="h-3 w-3 text-white" aria-hidden />
                </span>
                {bullet}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </aside>

      <div className="flex items-center justify-center bg-subtle px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
