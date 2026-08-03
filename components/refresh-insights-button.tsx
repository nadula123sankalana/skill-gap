"use client";

import { useTransition } from "react";
import { refreshInsightsAction } from "@/app/actions/assessment";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RefreshInsightsButton() {
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
            await refreshInsightsAction();
            toast({
              title: "Insights refreshed",
              description: "Free-text theme summary has been updated.",
              variant: "success",
            });
          } catch {
            toast({
              title: "Refresh failed",
              description: "Could not refresh insights. Try again.",
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
        "Refresh insights"
      )}
    </Button>
  );
}
