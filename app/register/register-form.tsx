"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerStudent, type ActionResult } from "@/app/actions/auth";
import { useActionToast } from "@/hooks/use-action-toast";
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

const initial: ActionResult = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          Creating account…
        </>
      ) : (
        "Create account"
      )}
    </Button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(registerStudent, initial);
  useActionToast(state);

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/login"), 1000);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Student registration</CardTitle>
        <CardDescription>
          Create an account to take the skill gap assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message && !state.success && (
            <Alert variant="destructive">{state.message}</Alert>
          )}

          <Field
            id="name"
            label="Full name"
            name="name"
            autoComplete="name"
            error={state.errors?.name?.[0]}
          />
          <Field
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={state.errors?.email?.[0]}
          />
          <Field
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            error={state.errors?.password?.[0]}
          />
          <Field
            id="university"
            label="University"
            name="university"
            error={state.errors?.university?.[0]}
          />
          <Field
            id="degreeProgram"
            label="Degree program"
            name="degreeProgram"
            error={state.errors?.degreeProgram?.[0]}
          />
          <Field
            id="year"
            label="Year of study"
            name="year"
            type="number"
            min={1}
            max={8}
            error={state.errors?.year?.[0]}
          />

          <SubmitButton />

          <p className="text-center text-sm text-muted">
            Already registered?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  error,
  min,
  max,
  autoComplete,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  error?: string;
  min?: number;
  max?: number;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        min={min}
        max={max}
        autoComplete={autoComplete}
        required
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-xs text-severity-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
