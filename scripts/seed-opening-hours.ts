// scripts/seed-opening-hours.ts
import { Client, Databases } from "node-appwrite";
import { config } from "dotenv";

// Bun .env.local'ı otomatik yüklemez; biz yükleyelim:
config({ path: ".env.local" });

const requireEnv = (k: string): string => {
  const v = process.env[k];
  if (!v || !v.trim()) {
    throw new Error(`Missing env: ${k}`);
  }
  return v;
};

// Senin .env.local'daki adlar:
const endpoint = requireEnv("NEXT_PUBLIC_ENDPOINT"); // https://cloud.appwrite.io/v1
const projectId = requireEnv("PROJECT_ID"); // 6876602a...
const apiKey = requireEnv("API_KEY"); // Server API Key
const databaseId = requireEnv("DATABASE_ID");
const openingColId = requireEnv("OPENING_HOURS_COLLECTION_ID");

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new Databases(client);

// 1=Mon ... 7=Sun
const HOURS: Record<number, { open: string; close: string }> = {
  1: { open: "09:00", close: "17:00" },
  2: { open: "09:00", close: "17:00" },
  3: { open: "09:00", close: "17:00" },
  4: { open: "09:00", close: "17:00" },
  5: { open: "09:00", close: "17:00" },
  6: { open: "10:00", close: "14:00" },
  7: { open: "00:00", close: "00:00" }, // kapalı
};

async function upsert(weekday: number, open: string, close: string) {
  const id = `wh_${weekday}`;
  try {
    await db.createDocument(databaseId, openingColId, id, {
      weekday,
      open,
      close,
    });
    console.log("created", id, open, close);
  } catch (e: unknown) {
    await db.updateDocument(databaseId, openingColId, id, { open, close });
    console.log("updated", id, open, close);
  }
}

async function main() {
  for (const w of Object.keys(HOURS).map(Number)) {
    const { open, close } = HOURS[w];
    await upsert(w, open, close);
  }
  console.log("Seed OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
