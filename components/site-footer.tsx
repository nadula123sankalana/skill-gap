import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function SiteFooter() {
  const session = await getSession();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display font-semibold text-primary">
            SkillGap Assess
          </span>
          <span className="mx-2 text-border">·</span>
          Internship readiness for career services
        </p>
        <nav className="flex flex-wrap gap-4">
          {session?.user ? (
            <Link
              href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="hover:text-primary"
            >
              {session.user.role === "ADMIN" ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary">
                Log in
              </Link>
              <Link href="/register" className="hover:text-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
}
