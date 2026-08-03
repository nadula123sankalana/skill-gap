import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Pick up where your readiness plan left off"
      subtitle="Sign in to review your latest gap report, refresh recommendations, or start a new assessment."
      bullets={[
        "Gaps reclassify automatically against live thresholds",
        "Recommendations update when your institution adds resources",
        "Administrators land straight in the configuration console",
      ]}
    >
      <LoginForm />
    </AuthShell>
  );
}
