"use client";

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-client";
import { SessionSync } from "@/components/session-sync";
import type { Session } from "@/lib/auth";

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider session={session}>
      <SessionSync />
      {children}
      <Toaster />
    </AuthProvider>
  );
}
