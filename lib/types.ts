import { ObjectId } from "mongodb";

export type Role = "STUDENT" | "ADMIN";
export type SkillCategory = "TECHNICAL" | "SOFT";
export type AssessmentStatus = "DRAFT" | "SUBMITTED";
export type Severity = "RED" | "YELLOW" | "GREEN";
export type ResourceType = "COURSE" | "WORKSHOP" | "PROJECT";
export type RecommendationStatus = "PENDING" | "IN_PROGRESS" | "DONE";
export type InternshipMatchLevel =
  | "STRONG"
  | "POTENTIAL"
  | "DEVELOPING"
  | "SIGNIFICANT";

export type UserDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
};

export type StudentProfileDoc = {
  _id: ObjectId;
  userId: ObjectId;
  university: string;
  degreeProgram: string;
  year: number;
};

export type SkillDoc = {
  _id: ObjectId;
  name: string;
  category: SkillCategory;
  description: string;
  createdAt: Date;
};

export type IndustryBenchmarkDoc = {
  _id: ObjectId;
  skillId: ObjectId;
  requiredScore: number;
  sector: string;
  updatedAt: Date;
};

export type AssessmentDoc = {
  _id: ObjectId;
  studentId: ObjectId;
  submittedAt: Date | null;
  status: AssessmentStatus;
  createdAt: Date;
};

export type AssessmentResponseDoc = {
  _id: ObjectId;
  assessmentId: ObjectId;
  skillId: ObjectId;
  rawRating: number;
  normalizedScore: number;
};

export type AssessmentFreeTextResponseDoc = {
  _id: ObjectId;
  assessmentId: ObjectId;
  questionKey: string;
  responseText: string;
};

export type SkillGapDoc = {
  _id: ObjectId;
  studentId: ObjectId;
  skillId: ObjectId;
  assessmentId: ObjectId;
  gapScore: number;
  severity: Severity;
};

export type RecommendationRuleDoc = {
  _id: ObjectId;
  skillId: ObjectId;
  minGapThreshold: number;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: ResourceType;
  priority: number;
};

export type RecommendationDoc = {
  _id: ObjectId;
  studentId: ObjectId;
  skillId: ObjectId;
  ruleId: ObjectId | null;
  /** Rule-based focus plan text (shared across this student's recommendations). */
  aiPersonalizedText: string | null;
  status: RecommendationStatus;
  createdAt: Date;
};

export type SeverityConfigDoc = {
  _id: ObjectId;
  greenMaxGap: number;
  yellowMaxGap: number;
  updatedAt: Date;
};

export type CohortSummaryDoc = {
  _id: ObjectId;
  skillId: ObjectId;
  meanScore: number;
  computedAt: Date;
};

export type AdminInsightDoc = {
  _id: ObjectId;
  summaryText: string;
  refreshedAt: Date;
};

/** Admin-configured internship role with skill score requirements. */
export type InternshipRoleRequirementDoc = {
  skillId: ObjectId;
  minScore: number;
};

export type InternshipRoleDoc = {
  _id: ObjectId;
  title: string;
  summary: string;
  /** Lower sorts first in match lists. */
  priority: number;
  requirements: InternshipRoleRequirementDoc[];
  createdAt: Date;
  updatedAt: Date;
};

/** UI-facing shape with string ids */
export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  createdAt: Date;
};

export type IndustryBenchmark = {
  id: string;
  skillId: string;
  requiredScore: number;
  sector: string;
  updatedAt: Date;
  skill?: { name: string };
};

export type RecommendationRule = {
  id: string;
  skillId: string;
  minGapThreshold: number;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: ResourceType;
  priority: number;
  skill?: { name: string };
};

export type SeverityConfig = {
  id: string;
  greenMaxGap: number;
  yellowMaxGap: number;
  updatedAt: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
};

export function oid(id: string): ObjectId {
  return new ObjectId(id);
}

export function idStr(id: ObjectId | string): string {
  return typeof id === "string" ? id : id.toHexString();
}
