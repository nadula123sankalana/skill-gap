"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/auth";
import { createBenchmark, updateBenchmark } from "@/app/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { EmptyState } from "@/components/empty-state";
import { FormAlert } from "@/components/admin/form-alert";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target } from "lucide-react";
import { nativeSelectClass } from "@/lib/utils";

const initial: ActionResult = { success: false, message: "" };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          Saving…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

type SkillOption = { id: string; name: string };
type BenchmarkRow = {
  id: string;
  skillId: string;
  requiredScore: number;
  sector: string;
  skill: { name: string };
};

export function BenchmarksManager({
  skills,
  benchmarks,
}: {
  skills: SkillOption[];
  benchmarks: BenchmarkRow[];
}) {
  const [createState, createAction] = useFormState(createBenchmark, initial);
  useActionToast(createState);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add benchmark</CardTitle>
          <CardDescription>
            Required score is on a 0–100 scale matching normalized assessment
            scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 sm:grid-cols-2">
            <FormAlert
              className="sm:col-span-2"
              message={createState.message || undefined}
              success={createState.success}
            />
            <div className="space-y-1.5">
              <Label htmlFor="skillId">Skill</Label>
              <select
                id="skillId"
                name="skillId"
                className={nativeSelectClass}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select skill
                </option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                name="sector"
                placeholder="e.g. Software Engineering"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requiredScore">Required score (0–100)</Label>
              <Input
                id="requiredScore"
                name="requiredScore"
                type="number"
                min={0}
                max={100}
                step={1}
                required
              />
            </div>
            <div className="flex items-end">
              <Submit label="Create benchmark" />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-medium">
            Existing benchmarks
          </h2>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {benchmarks.length} total
          </span>
        </div>
        {benchmarks.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No benchmarks yet"
            description="Add a required score per skill and sector to power gap analysis."
          />
        ) : (
          <StaggerGroup className="space-y-4" stagger={0.05}>
            {benchmarks.map((b) => (
              <StaggerItem key={b.id}>
                <BenchmarkEditCard benchmark={b} skills={skills} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}

function BenchmarkEditCard({
  benchmark,
  skills,
}: {
  benchmark: BenchmarkRow;
  skills: SkillOption[];
}) {
  const [state, action] = useFormState(updateBenchmark, initial);
  useActionToast(state);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="id" value={benchmark.id} />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-3">
            <span className="font-display text-base font-medium text-foreground">
              {benchmark.skill.name}
            </span>
            <span className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
              {benchmark.sector}
            </span>
          </div>
          <FormAlert
            className="sm:col-span-3"
            message={state.message || undefined}
            success={state.success}
          />
          <div className="space-y-1.5">
            <Label>Skill</Label>
            <select
              name="skillId"
              className={nativeSelectClass}
              defaultValue={benchmark.skillId}
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Sector</Label>
            <Input name="sector" defaultValue={benchmark.sector} required />
          </div>
          <div className="space-y-1.5">
            <Label>Required score</Label>
            <Input
              name="requiredScore"
              type="number"
              min={0}
              max={100}
              defaultValue={benchmark.requiredScore}
              required
            />
          </div>
          <div className="sm:col-span-3">
            <Submit label="Save changes" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
