"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
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
  const { user } = useSession();
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
    if (!user) {
      clearAuthSessionState();
      return;
    }

    const prev = getAuthSessionState();
    setAuthSessionState({
      id: user.id,
      email: user.email,
      role: user.role,
      remembered: prev?.remembered ?? false,
      signedInAt: prev?.signedInAt ?? Date.now(),
    });
  }, [user]);

  return null;
}
