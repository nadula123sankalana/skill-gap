import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-base font-semibold tracking-tight text-primary"
        >
          SkillGap&nbsp;Assess
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <span className="hidden text-muted sm:inline">
                {session.user.name}
              </span>
              <Link
                href={
                  session.user.role === "ADMIN" ? "/admin" : "/dashboard"
                }
                className="text-foreground hover:text-primary"
              >
                {session.user.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-primary">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary-hover"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
