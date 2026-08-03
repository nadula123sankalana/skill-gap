"use client";

import { useTransition } from "react";
import { refreshRecommendationsAction } from "@/app/actions/assessment";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RefreshRecommendationsButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await refreshRecommendationsAction();
            toast({
              title: "Recommendations updated",
              description: "Latest rules and AI guidance have been applied.",
              variant: "success",
            });
          } catch {
            toast({
              title: "Refresh failed",
              description: "Could not refresh recommendations. Try again.",
              variant: "destructive",
            });
          }
        });
      }}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          Refreshing…
        </>
      ) : (
        "Refresh recommendations"
      )}
    </Button>
  );
}
