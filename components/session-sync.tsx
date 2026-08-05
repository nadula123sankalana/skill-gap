"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  clearAuthSessionState,
  getAuthSessionState,
  setAuthSessionState,
  setReturnTo,
} from "@/lib/session-storage";

/**
 * Syncs non-secret session state into sessionStorage (clears when the tab closes)
 * and stores the last protected path for post-login return.
 */
export function SessionSync() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname?.startsWith("/dashboard") ||
      pathname?.startsWith("/admin")
    ) {
      setReturnTo(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user) {
      clearAuthSessionState();
      return;
    }

    const prev = getAuthSessionState();
    setAuthSessionState({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      remembered: prev?.remembered ?? false,
      signedInAt: prev?.signedInAt ?? Date.now(),
    });
  }, [status, session]);

  return null;
}
