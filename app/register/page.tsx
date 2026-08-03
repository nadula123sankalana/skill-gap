import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Create your account"
      title="Know exactly where you stand before applications open"
      subtitle="Register once, then measure your skills against the benchmarks your career services team maintains."
      bullets={[
        "Free for students — no credit card required",
        "Skip any skill you are unsure about; it is never scored as zero",
        "Save a draft and finish your assessment later",
      ]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
