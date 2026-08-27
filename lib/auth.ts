import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { encode as jwtEncode, decode as jwtDecode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { collections } from "@/lib/mongodb";
import type { Role } from "@/lib/types";
import { idStr, oid } from "@/lib/types";
import { SESSION_COOKIE_NAME, useSecureCookies } from "@/lib/auth-cookies";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
    remember?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    remember?: boolean;
  }
}

/** Persistent login (Keep me signed in): 30 days. */
const PERSISTENT_MAX_AGE = 30 * 24 * 60 * 60;
/** Browser session style (default, higher security): 12 hours. */
const SESSION_MAX_AGE = 12 * 60 * 60;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    // Cookie upper bound; jwt.encode() below shortens the token itself when
    // "Keep me signed in" was left unchecked.
    maxAge: PERSISTENT_MAX_AGE,
    updateAge: 60 * 60, // refresh claims hourly while active
  },
  jwt: {
    maxAge: PERSISTENT_MAX_AGE,
    /**
     * The session cookie is always written with the 30-day upper bound, so the
     * only place the "Keep me signed in" choice can actually be enforced is the
     * expiry baked into the encrypted JWT itself. Without this, an unchecked
     * box still produced a 30-day login.
     */
    async encode({ token, secret, salt }) {
      const maxAge = token?.remember ? PERSISTENT_MAX_AGE : SESSION_MAX_AGE;
      return jwtEncode({ token, secret, salt, maxAge });
    },
    decode: jwtDecode,
  },
  pages: {
    signIn: "/login",
  },
  // Production-hardening for the session cookie (JWT stays httpOnly — never in JS).
  cookies: {
    sessionToken: {
      // Shared with middleware — see lib/auth-cookies.ts.
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const { users } = await collections();
        const user = await users.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!valid) {
          return null;
        }

        const remember =
          credentials.remember === "true" || credentials.remember === "1";

        return {
          id: idStr(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          remember,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.remember = Boolean(user.remember);
        // Expiry itself is applied by the custom jwt.encode() above.
      }

      // Client-driven session.update(): the payload is attacker-controlled, so it
      // must never be merged into the token (that allowed STUDENT -> ADMIN
      // escalation). Re-read the authoritative identity from MongoDB instead.
      if (trigger === "update" && token.id) {
        try {
          const { users } = await collections();
          const fresh = await users.findOne(
            { _id: oid(token.id) },
            { projection: { name: 1, email: 1, role: 1 } }
          );
          if (fresh) {
            token.name = fresh.name;
            token.email = fresh.email;
            token.role = fresh.role;
          }
        } catch (err) {
          console.error("jwt update refresh failed:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

/** Never throw from the root layout — missing env on Vercel must not 500 the whole site. */
export async function getSession() {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      console.error(
        "NEXTAUTH_SECRET is not set. Auth will not work until it is configured."
      );
      return null;
    }
    return await getServerSession(authOptions);
  } catch (err) {
    console.error("getSession failed:", err);
    return null;
  }
}
