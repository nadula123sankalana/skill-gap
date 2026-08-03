"use server";

import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/mongodb";

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
}
