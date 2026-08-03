"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/auth";
import { createSkill, updateSkill, deleteSkill } from "@/app/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ListPlus } from "lucide-react";

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

type SkillRow = {
  id: string;
  name: string;
  category: "TECHNICAL" | "SOFT";
  description: string;
};

export function SkillsManager({ skills }: { skills: SkillRow[] }) {
  const [createState, createAction] = useFormState(createSkill, initial);
  useActionToast(createState);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add skill</CardTitle>
          <CardDescription>
            New skills become available in assessments automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 sm:grid-cols-2">
            {createState.message && !createState.success && (
              <Alert className="sm:col-span-2" variant="destructive">
                {createState.message}
              </Alert>
            )}
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                defaultValue="TECHNICAL"
              >
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT">Soft</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div>
              <Submit label="Create skill" />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Existing skills</h2>
        {skills.length === 0 ? (
          <EmptyState
            icon={ListPlus}
            title="No skills yet"
            description="Add your first skill above to start building the assessment catalogue."
          />
        ) : (
          skills.map((skill) => <SkillEditCard key={skill.id} skill={skill} />)
        )}
      </div>
    </div>
  );
}

function SkillEditCard({ skill }: { skill: SkillRow }) {
  const [state, action] = useFormState(updateSkill, initial);
  useActionToast(state);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={skill.id} />
          {state.message && !state.success && (
            <Alert className="sm:col-span-2" variant="destructive">
              {state.message}
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input name="name" defaultValue={skill.name} required />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              name="category"
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
              defaultValue={skill.category}
            >
              <option value="TECHNICAL">Technical</option>
              <option value="SOFT">Soft</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={skill.description}
              required
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Submit label="Save changes" />
            <ConfirmDeleteButton
              confirmMessage={`Delete skill “${skill.name}”? This cannot be undone.`}
              action={deleteSkill}
              name="id"
              value={skill.id}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
