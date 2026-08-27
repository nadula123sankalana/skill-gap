"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  consumeReturnTo,
  getLastEmail,
  setAuthSessionState,
} from "@/lib/session-storage";

export function LoginForm() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const reduced = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [emailDefault, setEmailDefault] = useState("");
  const [remember, setRemember] = useState(false);

  // Restore last email from tab sessionStorage
  useEffect(() => {
    setEmailDefault(getLastEmail());
  }, []);

  // Already signed in → go to the right home
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const dest =
        session.user.role === "ADMIN"
          ? "/admin"
          : consumeReturnTo("/dashboard");
      router.replace(dest);
    }
  }, [status, session, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      const keepSignedIn = form.get("remember") === "on";

      const result = await signIn("credentials", {
        email,
        password,
        remember: keepSignedIn ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        toast({
          title: "Sign in failed",
          description: "Check your email and password, then try again.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/api/auth/session");
      const nextSession = await res.json();
      const role = nextSession?.user?.role as string | undefined;
      const id = nextSession?.user?.id as string | undefined;

      if (id) {
        // Tab-scoped client session state (clears when this tab/window closes).
        setAuthSessionState({
          id,
          email: nextSession?.user?.email,
          role: role ?? "STUDENT",
          remembered: keepSignedIn,
          signedInAt: Date.now(),
        });
      }

      toast({
        title: "Signed in",
        description: keepSignedIn
          ? "Session saved on this device for up to 30 days."
          : "Session is active in this browser tab (clears when you close it).",
        variant: "success",
      });

      const fallback = role === "ADMIN" ? "/admin" : "/dashboard";
      const dest = role === "ADMIN" ? "/admin" : consumeReturnTo(fallback);
      router.push(dest);
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
      toast({
        title: "Sign in failed",
        description: "The authentication service could not be reached.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary lg:text-muted">
        Welcome back
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground">
        Log in
      </h1>
      <p className="mt-2 text-sm text-muted">
        Students go to the dashboard; admins go to configuration.
      </p>

      <form onSubmit={onSubmit} method="post" className="mt-8 space-y-4">
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="login-error"
              initial={reduced ? undefined : { opacity: 0, height: 0 }}
              animate={reduced ? undefined : { opacity: 1, height: "auto" }}
              exit={reduced ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <Alert variant="destructive">{error}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={emailDefault}
            key={emailDefault || "email-empty"}
            className="bg-white border-border/70 shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="bg-white border-border/70 shadow-none"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          <span>
            <span className="font-medium text-foreground">
              Keep me signed in
            </span>
            <span className="mt-0.5 block text-xs leading-snug">
              Saves a secure session cookie for 30 days. Leave unchecked for a
              shorter tab session (clears more quickly when you are done).
            </span>
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="h-4 w-4" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-sm text-muted">
          New student?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
