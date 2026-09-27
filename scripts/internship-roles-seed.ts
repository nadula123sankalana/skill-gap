/**
 * Demo internship roles keyed by skill name.
 * Requirements that don't exist in the DB are skipped at seed time.
 */
import { ObjectId, type Db } from "mongodb";
import type { InternshipRoleDoc } from "../lib/types";

export const internshipRolesSeed: {
  title: string;
  summary: string;
  priority: number;
  requirements: { skillName: string; minScore: number }[];
}[] = [
  {
    title: "Web Development Intern",
    summary:
      "Front-end focused internship emphasising web fundamentals and collaborative Git workflows. Cloud knowledge is not a major requirement.",
    priority: 1,
    requirements: [
      { skillName: "Web Development Fundamentals", minScore: 70 },
      { skillName: "Version Control (Git)", minScore: 60 },
      { skillName: "JavaScript & TypeScript", minScore: 65 },
      { skillName: "Problem Solving", minScore: 50 },
    ],
  },
  {
    title: "Full-Stack Developer Intern",
    summary:
      "End-to-end product work across JavaScript/React, APIs, and data. Backend testing and container basics strengthen this match.",
    priority: 2,
    requirements: [
      { skillName: "JavaScript & TypeScript", minScore: 70 },
      { skillName: "React / Frontend Frameworks", minScore: 65 },
      { skillName: "Version Control (Git)", minScore: 60 },
      { skillName: "SQL & Databases", minScore: 55 },
      { skillName: "API Design & Integration", minScore: 60 },
    ],
  },
  {
    title: "Software Engineering Intern",
    summary:
      "General software internship emphasising algorithms, Git, problem solving, and solid fundamentals across the stack.",
    priority: 3,
    requirements: [
      { skillName: "Data Structures & Algorithms", minScore: 70 },
      { skillName: "Version Control (Git)", minScore: 65 },
      { skillName: "Problem Solving", minScore: 65 },
      { skillName: "Testing & Debugging", minScore: 55 },
      { skillName: "Communication", minScore: 55 },
    ],
  },
  {
    title: "QA Engineering Intern",
    summary:
      "Quality-focused internship centred on testing, debugging, clear communication, and enough coding fluency to write test cases.",
    priority: 4,
    requirements: [
      { skillName: "Testing & Debugging", minScore: 70 },
      { skillName: "Problem Solving", minScore: 60 },
      { skillName: "Communication", minScore: 60 },
      { skillName: "Version Control (Git)", minScore: 55 },
      { skillName: "SQL & Databases", minScore: 45 },
    ],
  },
  {
    title: "DevOps Intern",
    summary:
      "Operations-leaning internship with strong Git expectations plus cloud and containerisation foundations.",
    priority: 5,
    requirements: [
      { skillName: "Version Control (Git)", minScore: 75 },
      { skillName: "Linux & Command Line", minScore: 60 },
      { skillName: "Cloud Fundamentals", minScore: 55 },
      { skillName: "Docker & Containers", minScore: 50 },
      { skillName: "Problem Solving", minScore: 55 },
    ],
  },
  {
    title: "Cloud/DevOps Engineer Intern",
    summary:
      "Cloud-heavy internship requiring containerisation and platform fundamentals alongside Git fluency.",
    priority: 6,
    requirements: [
      { skillName: "Cloud Fundamentals", minScore: 70 },
      { skillName: "Docker & Containers", minScore: 65 },
      { skillName: "Linux & Command Line", minScore: 60 },
      { skillName: "Version Control (Git)", minScore: 65 },
      { skillName: "API Design & Integration", minScore: 50 },
    ],
  },
  {
    title: "Data Analyst Intern",
    summary:
      "Analytics internship emphasising SQL, structured problem solving, and clear communication of findings.",
    priority: 7,
    requirements: [
      { skillName: "SQL & Databases", minScore: 75 },
      { skillName: "Problem Solving", minScore: 65 },
      { skillName: "Communication", minScore: 60 },
      { skillName: "Python Programming", minScore: 55 },
      { skillName: "Time Management", minScore: 50 },
    ],
  },
];

/** Upsert demo roles; skips requirement rows whose skill name is missing. */
export async function upsertInternshipRoles(db: Db): Promise<{
  upserted: number;
  skippedRequirements: number;
}> {
  const skills = db.collection("skills");
  const internshipRoles = db.collection<InternshipRoleDoc>("internshipRoles");

  const skillDocs = await skills.find({}).project({ name: 1 }).toArray();
  const byName = new Map(
    skillDocs.map((s) => [String(s.name).toLowerCase(), s._id as ObjectId])
  );

  let upserted = 0;
  let skippedRequirements = 0;

  for (const role of internshipRolesSeed) {
    const requirements: { skillId: ObjectId; minScore: number }[] = [];
    for (const req of role.requirements) {
      const skillId = byName.get(req.skillName.toLowerCase());
      if (!skillId) {
        skippedRequirements += 1;
        continue;
      }
      requirements.push({ skillId, minScore: req.minScore });
    }
    if (requirements.length === 0) continue;

    const existing = await internshipRoles.findOne({ title: role.title });
    const now = new Date();
    if (existing) {
      await internshipRoles.updateOne(
        { _id: existing._id },
        {
          $set: {
            summary: role.summary,
            priority: role.priority,
            requirements,
            updatedAt: now,
          },
        }
      );
    } else {
      await internshipRoles.insertOne({
        _id: new ObjectId(),
        title: role.title,
        summary: role.summary,
        priority: role.priority,
        requirements,
        createdAt: now,
        updatedAt: now,
      });
    }
    upserted += 1;
  }

  await internshipRoles.createIndex({ title: 1 }, { unique: true });
  await internshipRoles.createIndex({ priority: 1 });

  return { upserted, skippedRequirements };
}
