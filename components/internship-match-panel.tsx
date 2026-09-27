import type { RoleMatchResult } from "@/lib/internship-match";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";

const levelStyles = {
  STRONG: {
    badge: "bg-severity-green/15 text-severity-green",
    dot: "bg-severity-green",
    border: "border-severity-green/25",
  },
  POTENTIAL: {
    badge: "bg-severity-yellow/15 text-severity-yellow",
    dot: "bg-severity-yellow",
    border: "border-severity-yellow/25",
  },
  DEVELOPING: {
    badge: "bg-primary/10 text-primary",
    dot: "bg-primary",
    border: "border-primary/20",
  },
  SIGNIFICANT: {
    badge: "bg-severity-red/15 text-severity-red",
    dot: "bg-severity-red",
    border: "border-severity-red/25",
  },
} as const;

export function InternshipMatchPanel({
  matches,
  eyebrow = "Internship match",
  title = "Roles vs your assessed skills",
  description = "Transparent indicators from configured skill floors — not an application decision. Expand a role to see which requirements you meet.",
}: {
  matches: RoleMatchResult[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  if (matches.length === 0) {
    return (
      <Reveal>
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-8 text-sm text-muted">
          No internship roles are configured yet. An administrator can add roles
          under Admin → Internship roles.
        </div>
      </Reveal>
    );
  }

  return (
    <section>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-xl font-medium">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </Reveal>

      <StaggerGroup className="mt-5 space-y-3" stagger={0.05}>
        {matches.map((m) => {
          const style = levelStyles[m.level];
          return (
            <StaggerItem key={m.roleId}>
              <details
                className={cn(
                  "group rounded-2xl border bg-white shadow-soft open:shadow-lift",
                  style.border
                )}
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", style.dot)}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-display text-base font-medium text-foreground">
                        {m.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {m.metCount}/{m.requiredCount} requirements met · match
                        indicator {m.matchPercent}%
                        {m.mainGap ? ` · main gap: ${m.mainGap}` : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[0.7rem] font-semibold",
                      style.badge
                    )}
                  >
                    {m.levelLabel}
                  </span>
                </summary>

                <div className="space-y-4 border-t border-border px-5 py-4">
                  <p className="text-sm text-muted">{m.summary}</p>
                  <p className="text-sm font-medium text-foreground">{m.action}</p>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                          <th className="py-2 pr-3 font-semibold">Skill</th>
                          <th className="py-2 pr-3 font-semibold">Your score</th>
                          <th className="py-2 pr-3 font-semibold">Required</th>
                          <th className="py-2 font-semibold">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.requirements.map((r) => (
                          <tr
                            key={r.skillId}
                            className="border-b border-border/70"
                          >
                            <td className="py-2 pr-3 font-medium">{r.skillName}</td>
                            <td className="py-2 pr-3">
                              {r.studentScore === null
                                ? "—"
                                : `${Math.round(r.studentScore)}%`}
                            </td>
                            <td className="py-2 pr-3">{r.minScore}%</td>
                            <td className="py-2">
                              {r.met ? (
                                <span className="font-semibold text-severity-green">
                                  Met
                                </span>
                              ) : (
                                <span className="font-semibold text-severity-red">
                                  Gap
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
