import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookies";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    // A token carrying no recognised role (e.g. one issued before roles existed)
    // belongs to neither area. Sending it on to /dashboard would bounce it
    // straight back here, so make it re-authenticate instead of looping.
    if (role !== "STUDENT" && role !== "ADMIN") {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }

    // Students only on /dashboard/* — admins are redirected to /admin
    if (path.startsWith("/dashboard") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Admins only on /admin/* — students are redirected to /dashboard
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    // Without these two, middleware falls back to NextAuth's own defaults, which
    // are derived from NEXTAUTH_URL:
    //   - the cookie name would be the non-prefixed one whenever NEXTAUTH_URL is
    //     not https, so it would never find the `__Secure-` cookie the route
    //     handler actually writes in production;
    //   - the signed-out redirect would go via /api/auth/signin, which builds its
    //     callbackUrl from NEXTAUTH_URL rather than from the incoming request.
    // Both are pinned here so a misconfigured NEXTAUTH_URL cannot break routing.
    cookies: { sessionToken: { name: SESSION_COOKIE_NAME } },
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
