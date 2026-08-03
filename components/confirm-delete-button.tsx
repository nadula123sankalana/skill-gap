"use client";

import { useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ConfirmDeleteButton({
  label = "Delete",
  confirmMessage,
  action,
  name,
  value,
}: {
  label?: string;
  confirmMessage: string;
  action: (formData: FormData) => Promise<void>;
  name: string;
  value: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const fd = new FormData();
          fd.set(name, value);
          try {
            await action(fd);
            toast({
              title: "Deleted",
              description: "The record was removed.",
              variant: "success",
            });
          } catch {
            toast({
              title: "Delete failed",
              description: "Could not delete this record.",
              variant: "destructive",
            });
          }
        });
      }}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          Deleting…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
