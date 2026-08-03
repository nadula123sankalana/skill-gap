"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-subtle">
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-severity-red/10 text-severity-red">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="font-display text-2xl font-medium tracking-tight">
          Something went wrong
        </h1>
        <Alert variant="destructive" className="text-left">
          We couldn&apos;t load this page. You can try again, or go back home.
        </Alert>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
