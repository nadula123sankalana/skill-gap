import { SeverityBadge } from "@/components/severity-badge";

function WindowChrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-subtle px-4 py-3">
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
      </span>
      <span className="mx-auto rounded-full bg-white px-3 py-1 text-[0.7rem] font-medium text-muted ring-1 ring-border">
        {title}
      </span>
    </div>
  );
}

const assessmentRows = [
  { skill: "Python", rating: 4, tone: "bg-brand-blue" },
  { skill: "SQL & databases", rating: 3, tone: "bg-brand-violet" },
  { skill: "Version control", rating: 5, tone: "bg-brand-teal" },
  { skill: "Communication", rating: 3, tone: "bg-[#F5B942]" },
  { skill: "Problem solving", rating: 4, tone: "bg-brand-blue" },
];

/** Fake assessment screen used in the first feature section. */
export function AssessmentMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lift">
      <WindowChrome title="skillgap.app/dashboard/assessment" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-medium text-foreground">
              Technical skills
            </p>
            <p className="text-[0.7rem] text-muted">Step 1 of 3</p>
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
            Draft saved
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
          <div className="h-full w-2/3 rounded-full bg-brand-pill" />
        </div>

        <ul className="space-y-2.5">
          {assessmentRows.map((row) => (
            <li
              key={row.skill}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <span className="text-xs font-medium text-foreground">
                {row.skill}
              </span>
              <span className="flex gap-1" aria-hidden>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`h-5 w-5 rounded-md ${
                      n <= row.rating ? row.tone : "bg-accent"
                    }`}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const reportRows = [
  { skill: "Cloud fundamentals", score: 38, benchmark: 75, severity: "RED" },
  { skill: "SQL & databases", score: 58, benchmark: 78, severity: "YELLOW" },
  { skill: "Version control", score: 82, benchmark: 80, severity: "GREEN" },
  { skill: "Communication", score: 64, benchmark: 82, severity: "YELLOW" },
] as const;

/** Fake gap report used in the second feature section. */
export function ReportMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lift">
      <WindowChrome title="skillgap.app/dashboard" />
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-4 rounded-2xl bg-ink-band p-4 text-white">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 ring-2 ring-brand-teal/40">
            <span className="font-display text-xl font-medium text-brand-teal-light">
              68
            </span>
          </div>
          <div>
            <p className="font-display text-sm font-medium">
              Internship readiness
            </p>
            <p className="text-[0.7rem] text-white/60">
              2 critical gaps · 4 moderate · 6 on track
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {reportRows.map((row) => (
            <li key={row.skill} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">
                  {row.skill}
                </span>
                <SeverityBadge
                  severity={row.severity}
                  className="px-2 py-0.5 text-[0.65rem]"
                />
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-accent">
                <div
                  className={`h-full rounded-full ${
                    row.severity === "RED"
                      ? "bg-severity-red"
                      : row.severity === "YELLOW"
                        ? "bg-severity-yellow"
                        : "bg-severity-green"
                  }`}
                  style={{ width: `${row.score}%` }}
                />
                <span
                  className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-ink-800"
                  style={{ left: `${row.benchmark}%` }}
                  aria-hidden
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
