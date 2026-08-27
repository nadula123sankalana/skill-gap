"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useSession } from "@/lib/auth-client";
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

/**
 * Middleware sends a logged-out deep link here as ?callbackUrl=. Only a
 * same-origin student path is accepted back — anything else (absolute URL,
 * protocol-relative //host, an admin path) is discarded so the parameter can't
 * be used as an open redirect.
 */
function callbackPath(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (!url.pathname.startsWith("/dashboard")) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function LoginForm() {
  const router = useRouter();
  const { user } = useSession();
  const reduced = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [emailDefault, setEmailDefault] = useState("");
  const [remember, setRemember] = useState(false);
  // Guards the two paths that can navigate away (submit handler and the
  // already-signed-in effect) so they can never fire competing navigations —
  // two router calls to the same route in one tick cancel each other and the
  // page simply stays on /login.
  const navigatedRef = useRef(false);

  const goToHome = useCallback(
    (role: string | undefined) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      const dest =
        role === "ADMIN"
          ? "/admin"
          : (callbackPath() ?? consumeReturnTo("/dashboard"));
      router.replace(dest);
      router.refresh();
    },
    [router]
  );

  // Restore last email from tab sessionStorage
  useEffect(() => {
    setEmailDefault(getLastEmail());
  }, []);

  // Already signed in (revisiting /login) → go to the right home.
  useEffect(() => {
    if (user?.role === "STUDENT" || user?.role === "ADMIN") {
      goToHome(user.role);
    }
  }, [user, goToHome]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const keepSignedIn = form.get("remember") === "on";
    const callback = callbackPath();
    if (callback) form.set("callbackUrl", callback);

    try {
      // One server action does the whole thing: verify the password, sign the
      // token, set the cookie, and hand back a relative path. There is no
      // session endpoint to poll and no absolute URL to resolve, so there is
      // nothing here that can fail and silently strand the user on /login.
      const result = await loginAction(null, form);

      if (!result.success || !result.redirectTo) {
        setError(result.message);
        toast({
          title: "Sign in failed",
          description: result.message,
          variant: "destructive",
        });
        setPending(false);
        return;
      }

      setAuthSessionState({
        id: "",
        email: String(form.get("email") ?? ""),
        role: result.redirectTo.startsWith("/admin") ? "ADMIN" : "STUDENT",
        remembered: keepSignedIn,
        signedInAt: Date.now(),
      });

      toast({
        title: "Signed in",
        description: keepSignedIn
          ? "Session saved on this device for up to 30 days."
          : "Session is active for 12 hours on this browser.",
        variant: "success",
      });

      // Stays pending through the navigation — the dashboard is a dynamic
      // server route, so clearing it here would flip the button back while
      // nothing on screen had changed yet.
      navigatedRef.current = true;
      consumeReturnTo("/dashboard");
      router.replace(result.redirectTo);
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
      toast({
        title: "Sign in failed",
        description: "The authentication service could not be reached.",
        variant: "destructive",
      });
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
