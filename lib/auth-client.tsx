"use client";

import * as React from "react";
import type { Session } from "@/lib/auth";

/**
 * The session is read on the server (from the httpOnly cookie) and handed to the
 * client as a prop by the root layout.
 *
 * There is deliberately no client-side fetch of a /api/auth/session endpoint:
 * that request failing was what previously swallowed the post-login navigation,
 * and it also meant the navbar and the server could briefly disagree about who
 * was signed in. Rendering from a server-supplied value makes them consistent by
 * construction, and `status` is never "loading".
 */
const SessionContext = React.createContext<Session | null>(null);

export function AuthProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): {
  session: Session | null;
  user: Session["user"] | null;
  status: "authenticated" | "unauthenticated";
} {
  const session = React.useContext(SessionContext);
  return {
    session,
    user: session?.user ?? null,
    status: session?.user ? "authenticated" : "unauthenticated",
  };
}
