import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { collections } from "@/lib/mongodb";
import type { Role } from "@/lib/types";
import { idStr } from "@/lib/types";

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

const isProd = process.env.NODE_ENV === "production";

/** Persistent login (Keep me signed in): 30 days. */
const PERSISTENT_MAX_AGE = 30 * 24 * 60 * 60;
/** Browser session style (default, higher security): 12 hours. */
const SESSION_MAX_AGE = 12 * 60 * 60;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    // Upper bound; jwt callback shortens expiry when remember is false.
    maxAge: PERSISTENT_MAX_AGE,
    updateAge: 60 * 60, // refresh claims hourly while active
  },
  jwt: {
    maxAge: PERSISTENT_MAX_AGE,
  },
  pages: {
    signIn: "/login",
  },
  // Production-hardening for the session cookie (JWT stays httpOnly — never in JS).
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.remember = Boolean(user.remember);

        // Absolute expiry from sign-in time (sliding via updateAge still applies
        // within this window through NextAuth's default handling of maxAge).
        const lifetime = token.remember ? PERSISTENT_MAX_AGE : SESSION_MAX_AGE;
        token.exp = Math.floor(Date.now() / 1000) + lifetime;
      }

      // Optional client-driven session update
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      // Enforce short-lived sessions when not remembered
      if (token.remember === false && token.iat) {
        const maxExp = Number(token.iat) + SESSION_MAX_AGE;
        if (!token.exp || Number(token.exp) > maxExp) {
          token.exp = maxExp;
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
