"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/auth";
import {
  createInternshipRole,
  updateInternshipRole,
  deleteInternshipRole,
} from "@/app/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { EmptyState } from "@/components/empty-state";
import { FormAlert } from "@/components/admin/form-alert";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { nativeSelectClass } from "@/lib/utils";

const initial: ActionResult = { success: false, message: "" };
const REQ_SLOTS = 6;

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
type ReqRow = { skillId: string; minScore: number; skillName: string };
type RoleRow = {
  id: string;
  title: string;
  summary: string;
  priority: number;
  requirements: ReqRow[];
};

function RequirementFields({
  skills,
  defaults = [],
}: {
  skills: SkillOption[];
  defaults?: ReqRow[];
}) {
  const slots = Array.from({ length: REQ_SLOTS }, (_, i) => defaults[i] ?? null);

  return (
    <div className="space-y-3 sm:col-span-2">
      <Label>Skill requirements (min score 0–100)</Label>
      <p className="text-xs text-muted">
        Leave a skill blank to skip that row. Students meet a requirement when
        their normalized score is ≥ the minimum.
      </p>
      <div className="space-y-2">
        {slots.map((slot, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_7rem]">
            <select
              name="reqSkillId"
              className={nativeSelectClass}
              defaultValue={slot?.skillId ?? ""}
            >
              <option value="">— optional skill —</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input
              name="reqMinScore"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="Min"
              defaultValue={slot?.minScore ?? ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RolesManager({
  skills,
  roles,
}: {
  skills: SkillOption[];
  roles: RoleRow[];
}) {
  const [createState, createAction] = useFormState(createInternshipRole, initial);
  useActionToast(createState);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add internship role</CardTitle>
          <CardDescription>
            Configure transparent skill floors for matching. This is fully
            rule-based — no generative AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 sm:grid-cols-2">
            <FormAlert
              className="sm:col-span-2"
              message={createState.message || undefined}
              success={createState.success}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Role title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Web Development Intern"
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="summary">Short summary</Label>
              <Textarea
                id="summary"
                name="summary"
                placeholder="What this internship emphasises for students."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority (1 = listed first)</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                min={1}
                max={100}
                defaultValue={10}
                required
              />
            </div>
            <RequirementFields skills={skills} />
            <div>
              <Submit label="Create role" />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-medium">Existing roles</h2>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {roles.length} total
          </span>
        </div>
        {roles.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No internship roles yet"
            description="Add roles with skill floors to power transparent internship matching."
          />
        ) : (
          <StaggerGroup className="space-y-4" stagger={0.05}>
            {roles.map((role) => (
              <StaggerItem key={role.id}>
                <RoleEditCard role={role} skills={skills} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}

function RoleEditCard({
  role,
  skills,
}: {
  role: RoleRow;
  skills: SkillOption[];
}) {
  const [state, action] = useFormState(updateInternshipRole, initial);
  useActionToast(state);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={role.id} />
          <FormAlert
            className="sm:col-span-2"
            message={state.message || undefined}
            success={state.success}
          />
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Role title</Label>
            <Input name="title" defaultValue={role.title} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Summary</Label>
            <Textarea name="summary" defaultValue={role.summary} required />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Input
              name="priority"
              type="number"
              min={1}
              max={100}
              defaultValue={role.priority}
              required
            />
          </div>
          <RequirementFields skills={skills} defaults={role.requirements} />
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Submit label="Save changes" />
            <ConfirmDeleteButton
              confirmMessage={`Delete role “${role.title}”?`}
              action={deleteInternshipRole}
              name="id"
              value={role.id}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
