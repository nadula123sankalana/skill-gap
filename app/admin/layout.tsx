import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-full bg-subtle pb-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pill text-white">
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                  Admin
                </p>
                <p className="font-display text-base font-medium leading-tight">
                  Configuration
                </p>
              </div>
            </div>

            <AdminNav />

            <p className="mt-5 hidden truncate border-t border-border pt-4 text-xs text-muted lg:block">
              {session.user.email}
            </p>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
