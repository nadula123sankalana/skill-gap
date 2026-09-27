import { MongoClient, ServerApiVersion, type Db, type Collection } from "mongodb";
import type {
  UserDoc,
  StudentProfileDoc,
  SkillDoc,
  IndustryBenchmarkDoc,
  AssessmentDoc,
  AssessmentResponseDoc,
  AssessmentFreeTextResponseDoc,
  SkillGapDoc,
  RecommendationRuleDoc,
  RecommendationDoc,
  SeverityConfigDoc,
  CohortSummaryDoc,
  AdminInsightDoc,
  InternshipRoleDoc,
} from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getUri(): string {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not set");
  }
  return uri;
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getUri(), {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      // Node 17+ can pick IPv6 and fail TLS to Atlas; force stable family selection.
      autoSelectFamily: false,
      family: 4,
      serverSelectionTimeoutMS: 20_000,
      connectTimeoutMS: 20_000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });

    // Clear cache on failure so the next request can retry (e.g. after IP allowlist).
    global._mongoClientPromise = client.connect().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db();
}

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    studentProfiles: db.collection<StudentProfileDoc>("studentProfiles"),
    skills: db.collection<SkillDoc>("skills"),
    industryBenchmarks:
      db.collection<IndustryBenchmarkDoc>("industryBenchmarks"),
    assessments: db.collection<AssessmentDoc>("assessments"),
    assessmentResponses:
      db.collection<AssessmentResponseDoc>("assessmentResponses"),
    assessmentFreeTextResponses:
      db.collection<AssessmentFreeTextResponseDoc>(
        "assessmentFreeTextResponses"
      ),
    skillGaps: db.collection<SkillGapDoc>("skillGaps"),
    recommendationRules:
      db.collection<RecommendationRuleDoc>("recommendationRules"),
    recommendations: db.collection<RecommendationDoc>("recommendations"),
    severityConfig: db.collection<SeverityConfigDoc>("severityConfig"),
    cohortSummaries: db.collection<CohortSummaryDoc>("cohortSummaries"),
    adminInsights: db.collection<AdminInsightDoc>("adminInsights"),
    internshipRoles: db.collection<InternshipRoleDoc>("internshipRoles"),
  };
}

export type Collections = Awaited<ReturnType<typeof collections>>;

/** Ensure indexes used by the app (safe to call repeatedly). */
export async function ensureIndexes(): Promise<void> {
  const c = await collections();
  await Promise.all([
    c.users.createIndex({ email: 1 }, { unique: true }),
    c.studentProfiles.createIndex({ userId: 1 }, { unique: true }),
    c.industryBenchmarks.createIndex(
      { skillId: 1, sector: 1 },
      { unique: true }
    ),
    c.assessmentResponses.createIndex(
      { assessmentId: 1, skillId: 1 },
      { unique: true }
    ),
    c.assessmentFreeTextResponses.createIndex(
      { assessmentId: 1, questionKey: 1 },
      { unique: true }
    ),
    c.skillGaps.createIndex({ assessmentId: 1, skillId: 1 }, { unique: true }),
    c.skillGaps.createIndex({ studentId: 1 }),
    c.recommendations.createIndex({ studentId: 1 }),
    c.cohortSummaries.createIndex({ skillId: 1 }, { unique: true }),
    c.internshipRoles.createIndex({ title: 1 }, { unique: true }),
    c.internshipRoles.createIndex({ priority: 1 }),
  ]);
}

export type { Collection };
