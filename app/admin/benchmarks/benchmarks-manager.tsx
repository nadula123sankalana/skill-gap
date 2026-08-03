"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/auth";
import { createBenchmark, updateBenchmark } from "@/app/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target } from "lucide-react";

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
            {createState.message && (
              <Alert
                className="sm:col-span-2"
                variant={createState.success ? "success" : "destructive"}
              >
                {createState.message}
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="skillId">Skill</Label>
              <select
                id="skillId"
                name="skillId"
                className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
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
        <h2 className="font-display text-xl font-semibold">
          Existing benchmarks
        </h2>
        {benchmarks.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No benchmarks yet"
            description="Add a required score per skill and sector to power gap analysis."
          />
        ) : (
          benchmarks.map((b) => (
            <BenchmarkEditCard key={b.id} benchmark={b} skills={skills} />
          ))
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
          {state.message && (
            <Alert
              className="sm:col-span-3"
              variant={state.success ? "success" : "destructive"}
            >
              {state.message}
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label>Skill</Label>
            <select
              name="skillId"
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
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
