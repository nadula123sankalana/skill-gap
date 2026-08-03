"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { handleAssessmentForm } from "@/app/actions/assessment";
import type { ActionResult } from "@/app/actions/auth";
import { useActionToast } from "@/hooks/use-action-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { easeOut } from "@/lib/motion";

const initial: ActionResult = { success: false, message: "" };

const RATING_OPTIONS = [
  { value: "4", label: "Very Good" },
  { value: "3", label: "Good" },
  { value: "2", label: "Average" },
  { value: "1", label: "Poor" },
  { value: "skip", label: "Skip" },
] as const;

type SkillRow = {
  id: string;
  name: string;
  category: "TECHNICAL" | "SOFT";
  description: string;
};

type DraftData = {
  assessmentId: string | null;
  ratings: Record<string, string>;
  freeText: Record<string, string>;
};

function SubmitButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-2xl border border-border bg-white/95 p-3 shadow-lift backdrop-blur">
      <Button
        type="submit"
        name="intent"
        value="draft"
        variant="outline"
        disabled={pending}
      >
        {pending ? (
          <>
            <Spinner className="h-4 w-4" />
            Saving…
          </>
        ) : (
          "Save draft"
        )}
      </Button>
      <Button type="submit" name="intent" value="submit" disabled={pending}>
        {pending ? (
          <>
            <Spinner className="h-4 w-4" />
            Submitting…
          </>
        ) : (
          "Submit assessment"
        )}
      </Button>
    </div>
  );
}

export function AssessmentForm({
  skills,
  draft,
}: {
  skills: SkillRow[];
  draft: DraftData;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [state, formAction] = useFormState(handleAssessmentForm, initial);
  useActionToast(state);

  const [ratings, setRatings] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    for (const skill of skills) {
      seed[skill.id] = draft.ratings[skill.id] ?? "skip";
    }
    return seed;
  });

  const rated = Object.values(ratings).filter((v) => v !== "skip").length;
  const progress = skills.length > 0 ? (rated / skills.length) * 100 : 0;

  useEffect(() => {
    if (state.success && state.message.toLowerCase().includes("submitted")) {
      const t = setTimeout(() => router.push("/dashboard"), 800);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-8">
      {draft.assessmentId && (
        <input type="hidden" name="assessmentId" value={draft.assessmentId} />
      )}

      <div className="sticky top-16 z-20 rounded-2xl border border-border bg-white/95 px-5 py-4 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-foreground">
            {rated} of {skills.length} skills rated
          </p>
          <p className="text-xs text-muted">
            {skills.length - rated} skipped
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-accent">
          <motion.div
            className="h-full rounded-full bg-brand-pill"
            animate={{ width: `${progress}%` }}
            initial={false}
            transition={
              reduced ? { duration: 0 } : { duration: 0.45, ease: easeOut }
            }
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {state.message && !state.success && (
          <motion.div
            key="assessment-error"
            initial={reduced ? undefined : { opacity: 0, height: 0 }}
            animate={reduced ? undefined : { opacity: 1, height: "auto" }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden"
          >
            <Alert variant="destructive">{state.message}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerGroup className="space-y-4" stagger={0.05}>
        {skills.map((skill) => (
          <StaggerItem key={skill.id}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                      skill.category === "TECHNICAL"
                        ? "bg-accent text-primary"
                        : "bg-brand-teal/10 text-brand-teal-dark"
                    }`}
                  >
                    {skill.category === "TECHNICAL" ? "Technical" : "Soft skill"}
                  </span>
                </div>
                <CardDescription>{skill.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <input type="hidden" name="skillId" value={skill.id} />
                <fieldset>
                  <legend className="mb-3 text-sm font-medium">
                    How would you rate yourself?
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {RATING_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm transition-all hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:font-medium has-[:checked]:text-primary"
                      >
                        <input
                          type="radio"
                          name={`rating_${skill.id}`}
                          value={opt.value}
                          defaultChecked={
                            draft.ratings[skill.id] === opt.value ||
                            (!draft.ratings[skill.id] && opt.value === "skip")
                          }
                          onChange={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [skill.id]: opt.value,
                            }))
                          }
                          className="accent-primary"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    Skip excludes this skill from scoring and gap analysis — it
                    is never treated as a zero score.
                  </p>
                </fieldset>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reflection questions</CardTitle>
          <CardDescription>
            Optional free-text answers help career services understand your
            context. Stored unmodified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="freeText_career_goals">
              What kind of internship are you aiming for?
            </Label>
            <Textarea
              id="freeText_career_goals"
              name="freeText_career_goals"
              defaultValue={draft.freeText.career_goals ?? ""}
              placeholder="e.g. Backend engineering at a product company…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="freeText_biggest_challenge">
              What feels like your biggest readiness challenge right now?
            </Label>
            <Textarea
              id="freeText_biggest_challenge"
              name="freeText_biggest_challenge"
              defaultValue={draft.freeText.biggest_challenge ?? ""}
              placeholder="e.g. Interview algorithms, portfolio projects…"
            />
          </div>
        </CardContent>
      </Card>

      <SubmitButtons />
    </form>
  );
}
