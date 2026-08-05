"use client";

import { signOut } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { clearAuthSessionState } from "@/lib/session-storage";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        clearAuthSessionState();
        toast({
          title: "Signed out",
          description: "Session cleared on this device.",
          variant: "default",
        });
        void signOut({ callbackUrl: "/" });
      }}
    >
      Sign out
    </Button>
  );
}
