import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export default function NotFound() {
  return (
    <div className="bg-subtle">
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-4 py-20 text-center">
        <Reveal preset="scale">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-pill text-white shadow-glow">
            <Compass className="h-7 w-7" aria-hidden />
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            404
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">
            Page not found
          </h1>
          <p className="mt-3 text-muted">
            That URL doesn&apos;t match anything in SkillGap Assess.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/">Back home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
