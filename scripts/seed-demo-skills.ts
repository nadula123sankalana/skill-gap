/**
 * Upsert a demo-ready skill library (technical + soft skills) with benchmarks & rules.
 * Does NOT wipe users or existing assessments.
 *
 * Usage: npm run db:demo-skills
 */
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import type { SkillCategory, ResourceType } from "../lib/types";

const SECTOR = "Software Engineering";

const demoSkills: {
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
    ],
  },
  {
    name: "JavaScript & TypeScript",
    category: "TECHNICAL",
    description:
      "Modern JavaScript and TypeScript for building web apps, including ES modules, async patterns, and typing for safer code reviews.",
    requiredScore: 78,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "JavaScript.info — The Modern JavaScript Tutorial",
        resourceUrl: "https://javascript.info/",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "TypeScript Handbook — Everyday Types",
        resourceUrl: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
        resourceType: "COURSE",
        priority: 2,
      },
    ],
  },
  {
    name: "Python Programming",
    category: "TECHNICAL",
    description:
      "Writing clear Python for scripting, data handling, and backend internship tasks including modules, testing, and virtual environments.",
    requiredScore: 76,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Python Official Tutorial",
        resourceUrl: "https://docs.python.org/3/tutorial/",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 18,
        resourceTitle: "Build a CLI data cleaning script",
        resourceUrl: "https://example.edu/projects/python-cli",
        resourceType: "PROJECT",
        priority: 2,
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
    ],
  },
  {
    name: "React / Frontend Frameworks",
    category: "TECHNICAL",
    description:
      "Building component-based UIs with React (or similar frameworks), state management basics, and API-driven interfaces.",
    requiredScore: 74,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "React Official Docs — Learn React",
        resourceUrl: "https://react.dev/learn",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 18,
        resourceTitle: "Rebuild a small dashboard with React",
        resourceUrl: "https://example.edu/projects/react-dashboard",
        resourceType: "PROJECT",
        priority: 2,
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
    ],
  },
  {
    name: "Cloud Fundamentals",
    category: "TECHNICAL",
    description:
      "Basic cloud concepts (deploying a service, environment variables, logs) used in modern internship platforms.",
    requiredScore: 65,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "AWS Skill Builder — Cloud Essentials",
        resourceUrl: "https://skillbuilder.aws/",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "Deploy a simple API to a free cloud tier",
        resourceUrl: "https://example.edu/projects/cloud-deploy",
        resourceType: "PROJECT",
        priority: 2,
      },
    ],
  },
  {
    name: "Linux & Command Line",
    category: "TECHNICAL",
    description:
      "Navigating filesystems, running build scripts, using SSH, and basic process management expected in engineering internships.",
    requiredScore: 70,
    rules: [
      {
        minGapThreshold: 10,
        resourceTitle: "Linux Journey",
        resourceUrl: "https://linuxjourney.com/",
        resourceType: "COURSE",
        priority: 1,
      },
      {
        minGapThreshold: 15,
        resourceTitle: "Shell scripting mini-challenge set",
        resourceUrl: "https://example.edu/projects/shell-scripts",
        resourceType: "PROJECT",
        priority: 2,
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
        resourceTitle: "Agile teamwork essentials",
        resourceUrl: "https://www.atlassian.com/agile",
        resourceType: "COURSE",
        priority: 1,
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
    ],
  },
];

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");

  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1 },
    autoSelectFamily: false,
    family: 4,
  });
  await client.connect();
  const db = client.db();

  const skills = db.collection("skills");
  const industryBenchmarks = db.collection("industryBenchmarks");
  const recommendationRules = db.collection("recommendationRules");
  const skillGaps = db.collection("skillGaps");
  const recommendations = db.collection("recommendations");
  const assessmentResponses = db.collection("assessmentResponses");

  // Remove placeholder test skills from earlier admin trials
  const junkSkills = (await skills.find({}).toArray()).filter((s) =>
    /^(JAVA\s*SCRIPT|python)$/i.test(String(s.name).trim())
  );
  const junkIds = junkSkills.map((s) => s._id);
  if (junkIds.length) {
    await Promise.all([
      skills.deleteMany({ _id: { $in: junkIds } }),
      industryBenchmarks.deleteMany({ skillId: { $in: junkIds } }),
      recommendationRules.deleteMany({ skillId: { $in: junkIds } }),
      skillGaps.deleteMany({ skillId: { $in: junkIds } }),
      recommendations.deleteMany({ skillId: { $in: junkIds } }),
      assessmentResponses.deleteMany({ skillId: { $in: junkIds } }),
    ]);
    console.log(`Removed ${junkIds.length} placeholder skill(s).`);
  }

  // Drop orphan rules for missing skills
  const allSkillIds = (await skills.find({}).project({ _id: 1 }).toArray()).map(
    (s) => s._id
  );
  const orphanRules = await recommendationRules.deleteMany({
    skillId: { $nin: allSkillIds },
  });
  const orphanBench = await industryBenchmarks.deleteMany({
    skillId: { $nin: allSkillIds },
  });
  if (orphanRules.deletedCount || orphanBench.deletedCount) {
    console.log(
      `Cleaned orphan rules=${orphanRules.deletedCount}, benchmarks=${orphanBench.deletedCount}`
    );
  }

  let created = 0;
  let updated = 0;

  for (const item of demoSkills) {
    const existing = await skills.findOne({
      name: { $regex: `^${escapeRegex(item.name)}$`, $options: "i" },
    });

    let skillId: ObjectId;
    if (existing) {
      skillId = existing._id as ObjectId;
      await skills.updateOne(
        { _id: skillId },
        {
          $set: {
            name: item.name,
            category: item.category,
            description: item.description,
          },
        }
      );
      updated += 1;
    } else {
      skillId = new ObjectId();
      await skills.insertOne({
        _id: skillId,
        name: item.name,
        category: item.category,
        description: item.description,
        createdAt: new Date(),
      });
      created += 1;
    }

    await industryBenchmarks.updateOne(
      { skillId, sector: SECTOR },
      {
        $set: {
          skillId,
          requiredScore: item.requiredScore,
          sector: SECTOR,
          updatedAt: new Date(),
        },
        $setOnInsert: { _id: new ObjectId() },
      },
      { upsert: true }
    );

    // Replace rules for this skill so demos stay tidy
    await recommendationRules.deleteMany({ skillId });
    if (item.rules.length) {
      await recommendationRules.insertMany(
        item.rules.map((rule) => ({
          _id: new ObjectId(),
          skillId,
          ...rule,
        }))
      );
    }
  }

  const tech = await skills.countDocuments({ category: "TECHNICAL" });
  const soft = await skills.countDocuments({ category: "SOFT" });
  const total = await skills.countDocuments();
  const benches = await industryBenchmarks.countDocuments();
  const rules = await recommendationRules.countDocuments();

  console.log("Demo skill library ready.");
  console.log({ created, updated, total, technical: tech, soft, benches, rules });
  console.log("Open Admin → Skills / Benchmarks / Rules to show the client.");

  await client.close();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
