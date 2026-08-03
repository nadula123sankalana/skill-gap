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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  // Required in production (Vercel). Without this, getServerSession throws a 500.
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
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

        return {
          id: idStr(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
