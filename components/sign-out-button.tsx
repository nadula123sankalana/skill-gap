"use client";

import { signOut } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        toast({
          title: "Signed out",
          description: "See you next time.",
          variant: "default",
        });
        void signOut({ callbackUrl: "/" });
      }}
    >
      Sign out
    </Button>
  );
}
