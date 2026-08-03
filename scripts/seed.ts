/**
 * Seed MongoDB with starter admin, skills, benchmarks, rules, and severity config.
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import type {
  SkillCategory,
  ResourceType,
  UserDoc,
  StudentProfileDoc,
  SkillDoc,
  IndustryBenchmarkDoc,
  RecommendationRuleDoc,
  SeverityConfigDoc,
  AssessmentDoc,
  AssessmentResponseDoc,
  AssessmentFreeTextResponseDoc,
  SkillGapDoc,
  RecommendationDoc,
  CohortSummaryDoc,
} from "../lib/types";

const SECTOR = "Software Engineering";

const skillsSeed: {
  name: string;
  category: SkillCategory;
  description: string;
  requiredScore: number;
  rules: {
    minGapThreshold: number;
    resourceTitle: string;
    resourceUrl: string;
    resourceType: ResourceType;
    priority: number;
  }[];
}[] = [
  {
    name: "Data Structures & Algorithms",
    category: "TECHNICAL",
    description:
      "Ability to choose and implement appropriate data structures and analyze algorithmic complexity for common interview and internship problems.",
    requiredScore: 80,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Coursera — Algorithms Specialization (Stanford)",
        resourceUrl: "https://www.coursera.org/specializations/algorithms",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 20,
        resourceTitle: "LeetCode Explore — Interview Crash Course",
        resourceUrl: "https://leetcode.com/explore/",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Campus DSA clinic workshop",
        resourceUrl: "https://example.edu/workshops/dsa-clinic",
        resourceType: "WORKSHOP",
        priority: 3,
      },
    ],
  },
  {
    name: "Version Control (Git)",
    category: "TECHNICAL",
    description:
      "Confident use of Git for branching, pull requests, conflict resolution, and collaborative internship workflows.",
    requiredScore: 75,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Pro Git book — Chapters 1–3",
        resourceUrl: "https://git-scm.com/book/en/v2",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "GitHub Skills — Introduction to GitHub",
        resourceUrl: "https://skills.github.com/",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Team Git workflow workshop",
        resourceUrl: "https://example.edu/workshops/git-workflow",
        resourceType: "WORKSHOP",
        priority: 3,
      },
    ],
  },
  {
    name: "Web Development Fundamentals",
    category: "TECHNICAL",
    description:
      "HTML, CSS, and JavaScript fundamentals sufficient to contribute to front-end internship tasks.",
    requiredScore: 78,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "MDN Web Docs — Learn Web Development",
        resourceUrl: "https://developer.mozilla.org/en-US/docs/Learn",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 20,
        resourceTitle: "Build a responsive portfolio site",
        resourceUrl: "https://example.edu/projects/portfolio",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Front-end pair programming lab",
        resourceUrl: "https://example.edu/workshops/frontend-lab",
        resourceType: "WORKSHOP",
        priority: 3,
      },
    ],
  },
  {
    name: "SQL & Databases",
    category: "TECHNICAL",
    description:
      "Writing queries, understanding relational design, and reading schemas used in typical backend internship work.",
    requiredScore: 72,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Mode SQL Tutorial",
        resourceUrl: "https://mode.com/sql-tutorial/",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 18,
        resourceTitle: "Design and query a sample e-commerce schema",
        resourceUrl: "https://example.edu/projects/sql-schema",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Database fundamentals workshop",
        resourceUrl: "https://example.edu/workshops/databases",
        resourceType: "WORKSHOP",
        priority: 3,
      },
    ],
  },
  {
    name: "API Design & Integration",
    category: "TECHNICAL",
    description:
      "Consuming and designing REST APIs, understanding status codes, authentication headers, and JSON payloads.",
    requiredScore: 70,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "REST API Design — Best Practices guide",
        resourceUrl: "https://restfulapi.net/",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 20,
        resourceTitle: "Build a small public API client",
        resourceUrl: "https://example.edu/projects/api-client",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "API testing with Postman workshop",
        resourceUrl: "https://example.edu/workshops/postman",
        resourceType: "WORKSHOP",
        priority: 3,
      },
    ],
  },
  {
    name: "Testing & Debugging",
    category: "TECHNICAL",
    description:
      "Writing basic unit tests, using debuggers, and diagnosing failures in local and CI environments.",
    requiredScore: 68,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Jest Getting Started",
        resourceUrl: "https://jestjs.io/docs/getting-started",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "Add tests to an existing open-source module",
        resourceUrl: "https://example.edu/projects/add-tests",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Debugging strategies workshop",
        resourceUrl: "https://example.edu/workshops/debugging",
        resourceType: "WORKSHOP",
        priority: 3,
      },
    ],
  },
  {
    name: "Communication",
    category: "SOFT",
    description:
      "Clear written and verbal communication with mentors, teammates, and stakeholders during internship work.",
    requiredScore: 75,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Technical writing for engineers",
        resourceUrl: "https://developers.google.com/tech-writing",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "Weekly stand-up practice circle",
        resourceUrl: "https://example.edu/workshops/standup-practice",
        resourceType: "WORKSHOP",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Write a project status update template",
        resourceUrl: "https://example.edu/projects/status-update",
        resourceType: "PROJECT",
        priority: 3,
      },
    ],
  },
  {
    name: "Teamwork & Collaboration",
    category: "SOFT",
    description:
      "Working effectively in cross-functional teams, giving and receiving feedback, and sharing ownership of deliverables.",
    requiredScore: 72,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Collaborative project sprint (campus club)",
        resourceUrl: "https://example.edu/projects/team-sprint",
        resourceType: "PROJECT",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "Conflict resolution for student teams",
        resourceUrl: "https://example.edu/workshops/team-conflict",
        resourceType: "WORKSHOP",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Agile teamwork essentials",
        resourceUrl: "https://www.atlassian.com/agile",
        resourceType: "COURSE",
        priority: 3,
      },
    ],
  },
  {
    name: "Problem Solving",
    category: "SOFT",
    description:
      "Breaking ambiguous internship tasks into steps, researching options, and proposing reasoned solutions.",
    requiredScore: 78,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Structured problem-solving workshop",
        resourceUrl: "https://example.edu/workshops/problem-solving",
        resourceType: "WORKSHOP",
        priority: 1,
      },
      {
        minGapThreshold: 18,
        resourceTitle: "Case study: ship a bugfix under constraints",
        resourceUrl: "https://example.edu/projects/bugfix-case",
        resourceType: "PROJECT",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "How to approach open-ended engineering problems",
        resourceUrl: "https://example.edu/courses/open-ended-problems",
        resourceType: "COURSE",
        priority: 3,
      },
    ],
  },
  {
    name: "Time Management",
    category: "SOFT",
    description:
      "Prioritizing tasks, estimating effort, and meeting internship deadlines without constant supervision.",
    requiredScore: 70,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Personal kanban for students",
        resourceUrl: "https://example.edu/courses/personal-kanban",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "Sprint planning simulation workshop",
        resourceUrl: "https://example.edu/workshops/sprint-planning",
        resourceType: "WORKSHOP",
        priority: 2,
      },
      {
        minGapThreshold: 5,
        resourceTitle: "Track a two-week study plan publicly",
        resourceUrl: "https://example.edu/projects/study-plan",
        resourceType: "PROJECT",
        priority: 3,
      },
    ],
  },
];

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not set in .env");
  }

  console.log("Connecting to MongoDB…");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const users = db.collection<UserDoc>("users");
  const studentProfiles = db.collection<StudentProfileDoc>("studentProfiles");
  const skills = db.collection<SkillDoc>("skills");
  const industryBenchmarks =
    db.collection<IndustryBenchmarkDoc>("industryBenchmarks");
  const recommendationRules =
    db.collection<RecommendationRuleDoc>("recommendationRules");
  const severityConfig = db.collection<SeverityConfigDoc>("severityConfig");
  const assessments = db.collection<AssessmentDoc>("assessments");
  const assessmentResponses =
    db.collection<AssessmentResponseDoc>("assessmentResponses");
  const assessmentFreeTextResponses =
    db.collection<AssessmentFreeTextResponseDoc>(
      "assessmentFreeTextResponses"
    );
  const skillGaps = db.collection<SkillGapDoc>("skillGaps");
  const recommendations = db.collection<RecommendationDoc>("recommendations");
  const cohortSummaries = db.collection<CohortSummaryDoc>("cohortSummaries");

  console.log("Clearing collections…");
  await Promise.all([
    recommendations.deleteMany({}),
    skillGaps.deleteMany({}),
    assessmentResponses.deleteMany({}),
    assessmentFreeTextResponses.deleteMany({}),
    assessments.deleteMany({}),
    recommendationRules.deleteMany({}),
    industryBenchmarks.deleteMany({}),
    cohortSummaries.deleteMany({}),
    studentProfiles.deleteMany({}),
    skills.deleteMany({}),
    severityConfig.deleteMany({}),
    users.deleteMany({}),
  ]);

  await users.createIndex({ email: 1 }, { unique: true });
  await studentProfiles.createIndex({ userId: 1 }, { unique: true });
  await industryBenchmarks.createIndex(
    { skillId: 1, sector: 1 },
    { unique: true }
  );

  const passwordHash = await bcrypt.hash("Admin123!", 12);
  await users.insertOne({
    _id: new ObjectId(),
    name: "System Admin",
    email: "admin@university.edu",
    passwordHash,
    role: "ADMIN",
    createdAt: new Date(),
  });

  await severityConfig.insertOne({
    _id: new ObjectId(),
    greenMaxGap: 10,
    yellowMaxGap: 25,
    updatedAt: new Date(),
  });

  for (const skill of skillsSeed) {
    const skillId = new ObjectId();
    await skills.insertOne({
      _id: skillId,
      name: skill.name,
      category: skill.category,
      description: skill.description,
      createdAt: new Date(),
    });

    await industryBenchmarks.insertOne({
      _id: new ObjectId(),
      skillId,
      requiredScore: skill.requiredScore,
      sector: SECTOR,
      updatedAt: new Date(),
    });

    await recommendationRules.insertMany(
      skill.rules.map((rule) => ({
        _id: new ObjectId(),
        skillId,
        ...rule,
      }))
    );
  }

  const counts = {
    users: await users.countDocuments(),
    skills: await skills.countDocuments(),
    benchmarks: await industryBenchmarks.countDocuments(),
    rules: await recommendationRules.countDocuments(),
    severity: await severityConfig.countDocuments(),
  };

  console.log("Seed complete:", counts);
  console.log("Admin login: admin@university.edu / Admin123!");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
