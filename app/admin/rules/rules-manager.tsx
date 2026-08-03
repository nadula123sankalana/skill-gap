"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/auth";
import { createRule, updateRule, deleteRule } from "@/app/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
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
import { BookOpen } from "lucide-react";
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
type RuleRow = {
  id: string;
  skillId: string;
  minGapThreshold: number;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: "COURSE" | "WORKSHOP" | "PROJECT";
  priority: number;
  skill: { name: string };
};

export function RulesManager({
  skills,
  rules,
}: {
  skills: SkillOption[];
  rules: RuleRow[];
}) {
  const [createState, createAction] = useFormState(createRule, initial);
  useActionToast(createState);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add recommendation rule</CardTitle>
          <CardDescription>
            Rules match when a student&apos;s gap score meets the minimum
            threshold. Lower priority number = higher preference.
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
              <Label htmlFor="minGapThreshold">Min gap threshold</Label>
              <Input
                id="minGapThreshold"
                name="minGapThreshold"
                type="number"
                min={0}
                max={100}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="resourceTitle">Resource title</Label>
              <Input id="resourceTitle" name="resourceTitle" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="resourceUrl">Resource URL</Label>
              <Input
                id="resourceUrl"
                name="resourceUrl"
                type="url"
                placeholder="https://"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resourceType">Type</Label>
              <select
                id="resourceType"
                name="resourceType"
                className={nativeSelectClass}
                defaultValue="COURSE"
              >
                <option value="COURSE">Course</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority (1 = highest)</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                min={1}
                max={100}
                defaultValue={1}
                required
              />
            </div>
            <div>
              <Submit label="Create rule" />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-medium">Existing rules</h2>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {rules.length} total
          </span>
        </div>
        {rules.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No recommendation rules yet"
            description="Map gap thresholds to courses, workshops, or projects students can pursue."
          />
        ) : (
          <StaggerGroup className="space-y-4" stagger={0.05}>
            {rules.map((rule) => (
              <StaggerItem key={rule.id}>
                <RuleEditCard rule={rule} skills={skills} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}

function RuleEditCard({
  rule,
  skills,
}: {
  rule: RuleRow;
  skills: SkillOption[];
}) {
  const [state, action] = useFormState(updateRule, initial);
  useActionToast(state);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={rule.id} />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <span className="font-display text-base font-medium text-foreground">
              {rule.skill.name}
            </span>
            <span className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
              {rule.resourceType}
            </span>
            <span className="rounded-full bg-subtle px-2.5 py-1 text-[0.7rem] font-semibold text-muted">
              Priority {rule.priority}
            </span>
          </div>
          <FormAlert
            className="sm:col-span-2"
            message={state.message || undefined}
            success={state.success}
          />
          <div className="space-y-1.5">
            <Label>Skill</Label>
            <select
              name="skillId"
              className={nativeSelectClass}
              defaultValue={rule.skillId}
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Min gap threshold</Label>
            <Input
              name="minGapThreshold"
              type="number"
              defaultValue={rule.minGapThreshold}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Resource title</Label>
            <Input
              name="resourceTitle"
              defaultValue={rule.resourceTitle}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Resource URL</Label>
            <Input
              name="resourceUrl"
              type="url"
              defaultValue={rule.resourceUrl}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <select
              name="resourceType"
              className={nativeSelectClass}
              defaultValue={rule.resourceType}
            >
              <option value="COURSE">Course</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="PROJECT">Project</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Input
              name="priority"
              type="number"
              defaultValue={rule.priority}
              required
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Submit label="Save changes" />
            <ConfirmDeleteButton
              confirmMessage={`Delete rule “${rule.resourceTitle}”?`}
              action={deleteRule}
              name="id"
              value={rule.id}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
