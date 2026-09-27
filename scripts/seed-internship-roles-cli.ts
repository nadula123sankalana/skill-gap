/**
 * Upsert rule-based internship roles against whatever skills exist in MongoDB.
 * Usage: npm run db:seed-roles
 */
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import { upsertInternshipRoles } from "./internship-roles-seed";

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");

  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1 },
    autoSelectFamily: false,
    family: 4,
  });
  await client.connect();
  const result = await upsertInternshipRoles(client.db());
  console.log("Internship roles upserted:", result);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
