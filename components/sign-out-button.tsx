"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { clearAuthSessionState } from "@/lib/session-storage";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          // The server action clears the cookie; the client then navigates with
          // the App Router. No absolute callback URL is built anywhere, which is
          // why sign-out can no longer land on a stale host.
          await logoutAction();
          clearAuthSessionState();
          toast({
            title: "Signed out",
            description: "Session cleared on this device.",
            variant: "default",
          });
          router.replace("/");
          router.refresh();
        });
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
