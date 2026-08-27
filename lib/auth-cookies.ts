/**
 * Single source of truth for the session cookie name.
 *
 * Both the NextAuth route handler and the Edge middleware have to agree on this
 * name or authentication silently half-works: the cookie is written under one
 * name, `getToken()` in middleware looks for another, finds nothing, and bounces
 * every protected navigation back to /login while `useSession()` still reports
 * the user as signed in.
 *
 * NextAuth's own default derives the name from NEXTAUTH_URL (https → `__Secure-`
 * prefix). We deliberately do NOT depend on that here: NEXTAUTH_URL is an
 * environment variable that can be wrong in a deployment, and when it is, the
 * two halves disagree. NODE_ENV is set by the build itself and cannot drift.
 *
 * Kept free of any Node-only dependency (mongodb, bcrypt) so middleware can
 * import it on the Edge runtime.
 */
export const useSecureCookies = process.env.NODE_ENV === "production";

export const SESSION_COOKIE_NAME = useSecureCookies
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";
