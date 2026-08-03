import { Reveal } from "@/components/motion/reveal";

/** Gradient banner shared by every admin screen. */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal
      preset="fade"
      className="noise-overlay relative isolate overflow-hidden rounded-3xl bg-mesh-hero px-6 py-8 sm:px-9"
    >
      <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            {description}
          </p>
        </div>
        {action}
      </div>
    </Reveal>
  );
}
