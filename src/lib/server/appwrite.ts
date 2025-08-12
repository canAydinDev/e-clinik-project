import { Client, Users, Databases, Storage, ID, Query } from "node-appwrite";

export const {
  PROJECT_ID,
  API_KEY,

  EXAMINATION_COLLECTION_ID,
  PATIENT_COLLECTION_ID,

  NEXT_PUBLIC_BUCKET_ID,
  NEXT_PUBLIC_ENDPOINT,
} = process.env;

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_ENDPOINT!)
  .setProject(PROJECT_ID!)
  .setKey(API_KEY!);

const users = new Users(client);
const databases = new Databases(client);
const storage = new Storage(client);

const requireEnv = (k: string): string => {
  const v = process.env[k];
  if (!v || !v.trim()) throw new Error(`Missing env: ${k}`);
  return v;
};

export const DATABASE_ID: string = requireEnv("DATABASE_ID");
export const APPOINTMENT_COLLECTION_ID: string = requireEnv(
  "APPOINTMENT_COLLECTION_ID"
);
export const OPENING_HOURS_COLLECTION_ID: string = requireEnv(
  "OPENING_HOURS_COLLECTION_ID"
);
export const CLOSED_DAYS_COLLECTION_ID: string = requireEnv(
  "CLOSED_DAYS_COLLECTION_ID"
);

export { client, users, databases, storage, ID, Query };
