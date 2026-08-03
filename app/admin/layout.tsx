import { redirect } from "next/navigation";
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
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          Admin
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold">
          Configuration
        </h2>
        <AdminNav />
        <p className="mt-6 hidden text-xs text-muted lg:block">
          Signed in as {session.user.email}
        </p>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
