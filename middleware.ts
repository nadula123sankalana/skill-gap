import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyJwt } from "@/lib/jwt";

/**
 * Route protection.
 *
 * Everything here is derived from the incoming request and one fixed cookie
 * name — no NEXTAUTH_URL, no base-URL inference, no environment-dependent cookie
 * prefix. That means the same build behaves identically on the production
 * alias, a preview URL, a per-deployment URL, or a future custom domain.
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  const toLogin = () => {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  };

  if (!secret) {
    console.error("NEXTAUTH_SECRET is not set — cannot verify sessions.");
    return toLogin();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifyJwt(token, secret) : null;

  // No session, expired, tampered with, or carrying an unrecognised role.
  if (!payload) return toLogin();

  const role = payload.role;

  // Students only on /dashboard/* — admins are sent to their own home.
  if (path.startsWith("/dashboard") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Admins only on /admin/* — students are sent back to theirs.
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
