import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { collections } from "@/lib/mongodb";
import { idStr } from "@/lib/types";
import type { Role } from "@/lib/types";
import { SESSION_COOKIE, signJwt, verifyJwt } from "@/lib/jwt";

export { SESSION_COOKIE };

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};

/** "Keep me signed in": 30 days. Otherwise 12 hours. */
const PERSISTENT_MAX_AGE = 30 * 24 * 60 * 60;
const SESSION_MAX_AGE = 12 * 60 * 60;

export function authSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET (or AUTH_SECRET) is not set — sessions cannot be signed."
    );
  }
  return secret;
}

/**
 * Verify email + password against MongoDB.
 * Returns null for both "no such user" and "wrong password" so the caller can
 * never leak which one it was.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<Session["user"] | null> {
  const { users } = await collections();
  const user = await users.findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: idStr(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/** Issue the session cookie. Role comes from the database, never from input. */
export async function createSession(
  user: Session["user"],
  remember: boolean
): Promise<void> {
  const maxAge = remember ? PERSISTENT_MAX_AGE : SESSION_MAX_AGE;
  const token = await signJwt(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      remember,
    },
    authSecret(),
    maxAge
  );

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  });
}

export async function destroySession(): Promise<void> {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

/**
 * Read the current session. Never throws — a missing secret or a malformed
 * cookie yields null rather than a 500 from the root layout.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyJwt(token, authSecret());
    if (!payload) return null;

    return {
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role as Role,
      },
    };
  } catch (err) {
    // Next signals dynamic rendering (and redirects) by throwing tagged errors.
    // Swallowing those would break its static/dynamic detection, so only a
    // genuine failure is converted into "no session".
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("getSession failed:", err);
    return null;
  }
}
