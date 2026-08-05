"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionSync } from "@/components/session-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Keep client session warm while the tab is open (production pattern).
      refetchInterval={5 * 60}
      refetchOnWindowFocus
    >
      <SessionSync />
      {children}
      <Toaster />
    </SessionProvider>
  );
}
