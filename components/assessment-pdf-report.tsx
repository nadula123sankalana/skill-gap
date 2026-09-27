"use client";

import { usePDF, Margin } from "react-to-pdf";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { readinessLabel } from "@/lib/readiness";

export type ReportSkillRow = {
  name: string;
  score: number;
  benchmark: number;
  gap: number;
  status: string;
  severity: "RED" | "YELLOW" | "GREEN";
};

export type ReportRecommendation = {
  skill: string;
  title: string;
  url?: string | null;
};

type AssessmentPdfReportProps = {
  studentName: string;
  studentEmail?: string | null;
  submittedLabel: string;
  readiness: number;
  counts: { red: number; yellow: number; green: number };
  skills: ReportSkillRow[];
  guidanceText?: string | null;
  recommendations?: ReportRecommendation[];
};

function safeFilename(name: string) {
  return name.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(0, 60);
}

/**
 * Downloadable SkillGap assessment report (react-to-pdf).
 * Button sits outside the capture region so it is not painted into the PDF.
 */
export function AssessmentPdfReport({
  studentName,
  studentEmail,
  submittedLabel,
  readiness,
  counts,
  skills,
  guidanceText,
  recommendations = [],
}: AssessmentPdfReportProps) {
  const filename = `${safeFilename(studentName || "Student")}-SkillGap-Report.pdf`;
  const { toPDF, targetRef } = usePDF({
    filename,
    method: "save",
    page: { margin: Margin.MEDIUM, format: "A4", orientation: "portrait" },
  });

  const roundedReady = Math.round(readiness);

  return (
    <Reveal className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="font-display text-xl font-medium">Assessment report</h2>
          <p className="mt-1 text-sm text-muted">
            Download a PDF summary of your scores, gaps, and focus plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="no-print"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            type="button"
            className="no-print"
            onClick={() => toPDF()}
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Download PDF report
          </Button>
        </div>
      </div>

      <div
        ref={targetRef}
        className={cn(
          "rounded-2xl border border-border bg-white p-6 text-foreground shadow-soft sm:p-8",
          "print:border-0 print:shadow-none print:p-0"
        )}
      >
        <div className="border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            SkillGap Assess
          </p>
          <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">
            Skill gap assessment report
          </h3>
          <div className="mt-4 grid gap-1 text-sm text-muted sm:grid-cols-2">
            <p>
              <span className="font-medium text-foreground">Student:</span>{" "}
              {studentName}
            </p>
            {studentEmail && (
              <p>
                <span className="font-medium text-foreground">Email:</span>{" "}
                {studentEmail}
              </p>
            )}
            <p>
              <span className="font-medium text-foreground">Submitted:</span>{" "}
              {submittedLabel}
            </p>
            <p>
              <span className="font-medium text-foreground">Status:</span>{" "}
              {readinessLabel(roundedReady)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Metric label="Readiness" value={`${roundedReady}%`} />
          <Metric label="Critical gaps" value={String(counts.red)} tone="text-severity-red" />
          <Metric label="Moderate gaps" value={String(counts.yellow)} tone="text-severity-yellow" />
          <Metric label="On track" value={String(counts.green)} tone="text-severity-green" />
        </div>

        <div className="mt-8">
          <h4 className="font-display text-lg font-medium">Skill score breakdown</h4>
          <p className="mt-1 text-xs text-muted">
            Score is your normalized rating (0–100). Gap = benchmark − score.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-semibold">Skill</th>
                  <th className="py-2 pr-3 font-semibold">Score</th>
                  <th className="py-2 pr-3 font-semibold">Benchmark</th>
                  <th className="py-2 pr-3 font-semibold">Gap</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((item) => (
                  <tr
                    key={`${item.name}-${item.score}-${item.gap}`}
                    className="border-b border-border/70"
                  >
                    <td className="py-2.5 pr-3 font-medium">{item.name}</td>
                    <td className="py-2.5 pr-3">{Math.round(item.score)}%</td>
                    <td className="py-2.5 pr-3">{Math.round(item.benchmark)}%</td>
                    <td className="py-2.5 pr-3">{item.gap.toFixed(1)}</td>
                    <td className="py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          item.severity === "RED" &&
                            "bg-severity-red/10 text-severity-red",
                          item.severity === "YELLOW" &&
                            "bg-severity-yellow/10 text-severity-yellow",
                          item.severity === "GREEN" &&
                            "bg-severity-green/10 text-severity-green"
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-muted">
                      No scored skills in this assessment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {guidanceText && (
          <div className="mt-8">
            <h4 className="font-display text-lg font-medium">Focus plan</h4>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {guidanceText}
            </p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-8">
            <h4 className="font-display text-lg font-medium">Recommendations</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {recommendations.map((r, i) => (
                <li key={`${r.skill}-${i}`} className="rounded-xl bg-subtle px-4 py-3">
                  <p className="font-medium text-foreground">{r.skill}</p>
                  <p className="text-muted">{r.title}</p>
                  {r.url && (
                    <p className="mt-1 break-all text-xs text-primary">{r.url}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 text-xs text-muted">
          Generated by SkillGap Assess · {new Date().toLocaleString()}
        </p>
      </div>
    </Reveal>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-subtle px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-xl font-medium", tone)}>
        {value}
      </p>
    </div>
  );
}
