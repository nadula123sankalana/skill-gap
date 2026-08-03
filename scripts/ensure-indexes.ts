import "dotenv/config";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("studentProfiles")
    .createIndex({ userId: 1 }, { unique: true });
  await db
    .collection("industryBenchmarks")
    .createIndex({ skillId: 1, sector: 1 }, { unique: true });
  await db
    .collection("assessmentResponses")
    .createIndex({ assessmentId: 1, skillId: 1 }, { unique: true });
  await db
    .collection("assessmentFreeTextResponses")
    .createIndex({ assessmentId: 1, questionKey: 1 }, { unique: true });
  await db
    .collection("skillGaps")
    .createIndex({ assessmentId: 1, skillId: 1 }, { unique: true });
  await db.collection("skillGaps").createIndex({ studentId: 1 });
  await db.collection("recommendations").createIndex({ studentId: 1 });
  await db
    .collection("cohortSummaries")
    .createIndex({ skillId: 1 }, { unique: true });

  console.log("MongoDB indexes ensured.");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
