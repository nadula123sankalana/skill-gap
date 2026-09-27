"use server";

import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/mongodb";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  university: z.string().trim().min(2, "University is required"),
  degreeProgram: z.string().trim().min(2, "Degree program is required"),
  year: z.coerce.number().int().min(1).max(8),
});

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function registerStudent(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    university: formData.get("university"),
    degreeProgram: formData.get("degreeProgram"),
    year: formData.get("year"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  try {
    const { users, studentProfiles } = await collections();

    const existing = await users.findOne({ email });
    if (existing) {
      return {
        success: false,
        message: "An account with this email already exists.",
        errors: { email: ["Email already registered"] },
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userId = new ObjectId();

    await users.insertOne({
      _id: userId,
      name: data.name,
      email,
      passwordHash,
      role: "STUDENT",
      createdAt: new Date(),
    });

    await studentProfiles.insertOne({
      _id: new ObjectId(),
      userId,
      university: data.university,
      degreeProgram: data.degreeProgram,
      year: data.year,
    });

    return {
      success: true,
      message: "Account created. You can log in now.",
    };
  } catch (err) {
    console.error("registerStudent failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("SSL") ||
      msg.includes("TLS") ||
      msg.includes("MongoServerSelection") ||
      msg.includes("MongoNetwork")
    ) {
      return {
        success: false,
        message:
          "Cannot reach the database. Check DATABASE_URL and that your IP is allowed in MongoDB Atlas Network Access.",
      };
    }
    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginResult = {
  success: boolean;
  message: string;
  /** Where the client should navigate on success. Always an app-relative path. */
  redirectTo?: string;
};

/**
 * Sign in and set the session cookie.
 *
 * Returns a relative path rather than performing the redirect itself: the caller
 * navigates with the App Router, so no absolute base URL is ever constructed and
 * the flow works identically on every hostname the app is served from.
 */
export async function loginAction(
  _prev: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: "Enter your email and password." };
  }

  const remember = formData.get("remember") === "on";

  try {
    const user = await verifyCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    await createSession(user, remember);

    // Only a validated same-site path is honoured, so the field cannot be used
    // to bounce a user to another origin after login.
    const requested = String(formData.get("callbackUrl") ?? "");
    const safe =
      requested.startsWith("/") &&
      !requested.startsWith("//") &&
      requested.startsWith("/dashboard");

    return {
      success: true,
      message: "Signed in.",
      redirectTo: user.role === "ADMIN" ? "/admin" : safe ? requested : "/dashboard",
    };
  } catch (err) {
    console.error("loginAction failed:", err);
    return {
      success: false,
      message: "Unable to sign in right now. Please try again.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
