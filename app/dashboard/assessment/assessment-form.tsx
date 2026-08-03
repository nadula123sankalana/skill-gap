"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
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
    <div className="flex flex-wrap gap-3 sticky bottom-4 z-10 rounded-lg border border-border bg-surface/95 p-3 shadow-soft backdrop-blur">
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
  const [state, formAction] = useFormState(handleAssessmentForm, initial);
  useActionToast(state);

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

      {state.message && !state.success && (
        <Alert variant="destructive">{state.message}</Alert>
      )}

      <div className="space-y-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <span className="font-mono text-xs uppercase tracking-wide text-muted">
                  {skill.category}
                </span>
              </div>
              <CardDescription>{skill.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <input type="hidden" name="skillId" value={skill.id} />
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  How would you rate yourself?
                </legend>
                <div className="flex flex-wrap gap-3">
                  {RATING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name={`rating_${skill.id}`}
                        value={opt.value}
                        defaultChecked={
                          draft.ratings[skill.id] === opt.value ||
                          (!draft.ratings[skill.id] && opt.value === "skip")
                        }
                        className="accent-primary"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Skip excludes this skill from scoring and gap analysis — it is
                  never treated as a zero score.
                </p>
              </fieldset>
            </CardContent>
          </Card>
        ))}
      </div>

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
