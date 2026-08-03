"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { collections } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { oid } from "@/lib/types";
import type { ActionResult } from "@/app/actions/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

const skillSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  category: z.enum(["TECHNICAL", "SOFT"]),
  description: z.string().trim().min(5, "Description is required"),
});

export async function createSkill(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { skills } = await collections();
  await skills.insertOne({
    _id: new ObjectId(),
    ...parsed.data,
    createdAt: new Date(),
  });
  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  return { success: true, message: "Skill created." };
}

export async function updateSkill(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, message: "Missing skill id." };

  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { skills } = await collections();
  await skills.updateOne({ _id: oid(id) }, { $set: parsed.data });
  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  return { success: true, message: "Skill updated." };
}

export async function deleteSkill(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { skills } = await collections();
  await skills.deleteOne({ _id: oid(id) });
  revalidatePath("/admin/skills");
  revalidatePath("/admin");
}

const benchmarkSchema = z.object({
  skillId: z.string().min(1, "Skill is required"),
  requiredScore: z.coerce.number().min(0).max(100),
  sector: z.string().trim().min(2, "Sector is required"),
});

export async function createBenchmark(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = benchmarkSchema.safeParse({
    skillId: formData.get("skillId"),
    requiredScore: formData.get("requiredScore"),
    sector: formData.get("sector"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { industryBenchmarks } = await collections();
  try {
    await industryBenchmarks.insertOne({
      _id: new ObjectId(),
      skillId: oid(parsed.data.skillId),
      requiredScore: parsed.data.requiredScore,
      sector: parsed.data.sector,
      updatedAt: new Date(),
    });
  } catch {
    return {
      success: false,
      message: "A benchmark for this skill and sector already exists.",
    };
  }

  revalidatePath("/admin/benchmarks");
  revalidatePath("/admin");
  return { success: true, message: "Benchmark created." };
}

export async function updateBenchmark(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, message: "Missing benchmark id." };

  const parsed = benchmarkSchema.safeParse({
    skillId: formData.get("skillId"),
    requiredScore: formData.get("requiredScore"),
    sector: formData.get("sector"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { industryBenchmarks } = await collections();
  try {
    await industryBenchmarks.updateOne(
      { _id: oid(id) },
      {
        $set: {
          skillId: oid(parsed.data.skillId),
          requiredScore: parsed.data.requiredScore,
          sector: parsed.data.sector,
          updatedAt: new Date(),
        },
      }
    );
  } catch {
    return {
      success: false,
      message: "Could not update benchmark (duplicate skill/sector?).",
    };
  }

  revalidatePath("/admin/benchmarks");
  revalidatePath("/admin");
  return { success: true, message: "Benchmark updated." };
}

const ruleSchema = z.object({
  skillId: z.string().min(1),
  minGapThreshold: z.coerce.number().min(0).max(100),
  resourceTitle: z.string().trim().min(2),
  resourceUrl: z.string().trim().url("Enter a valid URL"),
  resourceType: z.enum(["COURSE", "WORKSHOP", "PROJECT"]),
  priority: z.coerce.number().int().min(1).max(100),
});

export async function createRule(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ruleSchema.safeParse({
    skillId: formData.get("skillId"),
    minGapThreshold: formData.get("minGapThreshold"),
    resourceTitle: formData.get("resourceTitle"),
    resourceUrl: formData.get("resourceUrl"),
    resourceType: formData.get("resourceType"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { recommendationRules } = await collections();
  await recommendationRules.insertOne({
    _id: new ObjectId(),
    skillId: oid(parsed.data.skillId),
    minGapThreshold: parsed.data.minGapThreshold,
    resourceTitle: parsed.data.resourceTitle,
    resourceUrl: parsed.data.resourceUrl,
    resourceType: parsed.data.resourceType,
    priority: parsed.data.priority,
  });
  revalidatePath("/admin/rules");
  revalidatePath("/admin");
  return { success: true, message: "Rule created." };
}

export async function updateRule(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, message: "Missing rule id." };

  const parsed = ruleSchema.safeParse({
    skillId: formData.get("skillId"),
    minGapThreshold: formData.get("minGapThreshold"),
    resourceTitle: formData.get("resourceTitle"),
    resourceUrl: formData.get("resourceUrl"),
    resourceType: formData.get("resourceType"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { recommendationRules } = await collections();
  await recommendationRules.updateOne(
    { _id: oid(id) },
    {
      $set: {
        skillId: oid(parsed.data.skillId),
        minGapThreshold: parsed.data.minGapThreshold,
        resourceTitle: parsed.data.resourceTitle,
        resourceUrl: parsed.data.resourceUrl,
        resourceType: parsed.data.resourceType,
        priority: parsed.data.priority,
      },
    }
  );
  revalidatePath("/admin/rules");
  revalidatePath("/admin");
  return { success: true, message: "Rule updated." };
}

export async function deleteRule(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { recommendationRules } = await collections();
  await recommendationRules.deleteOne({ _id: oid(id) });
  revalidatePath("/admin/rules");
  revalidatePath("/admin");
}

const severitySchema = z
  .object({
    greenMaxGap: z.coerce.number().min(0).max(100),
    yellowMaxGap: z.coerce.number().min(0).max(100),
  })
  .refine((d) => d.greenMaxGap < d.yellowMaxGap, {
    message: "Green max must be less than yellow max",
    path: ["yellowMaxGap"],
  });

export async function updateSeverityConfig(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = severitySchema.safeParse({
    greenMaxGap: formData.get("greenMaxGap"),
    yellowMaxGap: formData.get("yellowMaxGap"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.flatten().formErrors[0] ??
        parsed.error.flatten().fieldErrors.yellowMaxGap?.[0] ??
        "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { severityConfig, skillGaps } = await collections();
  const existing = await severityConfig.findOne({});
  if (existing) {
    await severityConfig.updateOne(
      { _id: existing._id },
      {
        $set: {
          greenMaxGap: parsed.data.greenMaxGap,
          yellowMaxGap: parsed.data.yellowMaxGap,
          updatedAt: new Date(),
        },
      }
    );
  } else {
    await severityConfig.insertOne({
      _id: new ObjectId(),
      greenMaxGap: parsed.data.greenMaxGap,
      yellowMaxGap: parsed.data.yellowMaxGap,
      updatedAt: new Date(),
    });
  }

  // Reclassify every stored gap using the live thresholds (not hardcoded)
  const { classifySeverity } = await import("@/lib/constants");
  const allGaps = await skillGaps.find({}).toArray();
  for (const gap of allGaps) {
    const next = classifySeverity(
      gap.gapScore,
      parsed.data.greenMaxGap,
      parsed.data.yellowMaxGap
    );
    if (next !== gap.severity) {
      await skillGaps.updateOne({ _id: gap._id }, { $set: { severity: next } });
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  return { success: true, message: "Severity thresholds saved." };
}
