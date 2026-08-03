"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { registerStudent, type ActionResult } from "@/app/actions/auth";
import { useActionToast } from "@/hooks/use-action-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

const initial: ActionResult = { success: false, message: "" };

type FormValues = {
  name: string;
  email: string;
  password: string;
  university: string;
  degreeProgram: string;
  year: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="flex-1" disabled={pending}>
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
  const reduced = useReducedMotion();
  const [step, setStep] = useState<1 | 2>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
    university: "",
    degreeProgram: "",
    year: "",
  });
  const [state, formAction] = useFormState(registerStudent, initial);
  useActionToast(state);

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/login"), 1000);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  useEffect(() => {
    if (!state.success && state.errors) {
      const step1Keys = ["name", "email", "password"];
      if (step1Keys.some((key) => state.errors?.[key]?.length)) {
        setStep(1);
      }
    }
  }, [state]);

  function updateField(name: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function goNext(e: React.FormEvent) {
    e.preventDefault();
    setStepError(null);

    if (!values.name.trim() || values.name.trim().length < 2) {
      setStepError("Please enter your full name.");
      return;
    }
    if (
      !values.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
    ) {
      setStepError("Please enter a valid email address.");
      return;
    }
    if (values.password.length < 8) {
      setStepError("Password must be at least 8 characters.");
      return;
    }

    setStep(2);
  }

  const progress = step === 1 ? 50 : 100;

  return (
    <div className="w-full">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary lg:text-muted">
        Create account
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground">
        Student registration
      </h1>
      <p className="mt-2 text-sm text-muted">
        {step === 1
          ? "Step 1 of 2 — create your account details."
          : "Step 2 of 2 — tell us about your studies."}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          <span className={step === 1 ? "text-primary" : undefined}>
            Account
          </span>
          <span className={step === 2 ? "text-primary" : undefined}>
            Studies
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-accent/80"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={step}
          aria-label={`Registration step ${step} of 2`}
        >
          <motion.div
            className="h-full rounded-full bg-brand-pill"
            animate={{ width: `${progress}%` }}
            initial={false}
            transition={
              reduced ? { duration: 0 } : { duration: 0.4, ease: easeOut }
            }
          />
        </div>
      </div>

      <form
        action={step === 2 ? formAction : undefined}
        onSubmit={step === 1 ? goNext : undefined}
        className="mt-8 space-y-4"
      >
        {step === 2 && (
          <>
            <input type="hidden" name="name" value={values.name} />
            <input type="hidden" name="email" value={values.email} />
            <input type="hidden" name="password" value={values.password} />
          </>
        )}

        <AnimatePresence initial={false}>
          {(stepError || (state.message && !state.success)) && (
            <motion.div
              key="register-error"
              initial={reduced ? undefined : { opacity: 0, height: 0 }}
              animate={reduced ? undefined : { opacity: 1, height: "auto" }}
              exit={reduced ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="overflow-hidden"
            >
              <Alert variant="destructive">
                {stepError || state.message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={reduced ? undefined : { opacity: 0, x: 16 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="space-y-4"
            >
              <Field
                id="name"
                label="Full name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={(v) => updateField("name", v)}
                error={state.errors?.name?.[0]}
              />
              <Field
                id="email"
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(v) => updateField("email", v)}
                error={state.errors?.email?.[0]}
              />
              <Field
                id="password"
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={(v) => updateField("password", v)}
                error={state.errors?.password?.[0]}
              />

              <Button type="submit" size="lg" className="w-full">
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={reduced ? undefined : { opacity: 0, x: 16 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="space-y-4"
            >
              <Field
                id="university"
                label="University"
                name="university"
                value={values.university}
                onChange={(v) => updateField("university", v)}
                error={state.errors?.university?.[0]}
              />
              <Field
                id="degreeProgram"
                label="Degree program"
                name="degreeProgram"
                value={values.degreeProgram}
                onChange={(v) => updateField("degreeProgram", v)}
                error={state.errors?.degreeProgram?.[0]}
              />
              <Field
                id="year"
                label="Year of study"
                name="year"
                type="number"
                min={1}
                max={8}
                value={values.year}
                onChange={(v) => updateField("year", v)}
                error={state.errors?.year?.[0]}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStepError(null);
                    setStep(1);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </Button>
                <SubmitButton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
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
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  error?: string;
  min?: number;
  max?: number;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(
          "border-border/70 bg-white shadow-none",
          error && "border-severity-red focus-visible:ring-severity-red/25"
        )}
      />
      {error && (
        <p className="text-xs text-severity-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
