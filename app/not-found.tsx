import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-mono text-sm uppercase tracking-wide text-muted">
        404
      </p>
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="text-muted">
        That URL doesn&apos;t match anything in SkillGap Assess.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </div>
  );
}
