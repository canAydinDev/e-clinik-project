// lib/server/appwrite.ts (örnek yol)
import { Client, Users, Databases, Storage, ID, Query } from "node-appwrite";

/** ---- Safe ENV helpers (lazy) ---- */
const requireEnv = (k: string): string => {
  const v = process.env[k];
  if (!v || !v.trim()) throw new Error(`Missing env: ${k}`);
  return v;
};

const getCoreEnv = () => ({
  ENDPOINT: requireEnv("NEXT_PUBLIC_ENDPOINT"), // sunucuda da okunabilir
  PROJECT_ID: requireEnv("PROJECT_ID"),
  API_KEY: requireEnv("API_KEY"),
});

export const DATABASE_ID = () => requireEnv("DATABASE_ID");
export const PATIENT_COLLECTION_ID = () => requireEnv("PATIENT_COLLECTION_ID");
export const SERVICES_COLLECTION_ID = () =>
  requireEnv("SERVICES_COLLECTION_ID");
export const APPOINTMENT_COLLECTION_ID = () =>
  requireEnv("APPOINTMENT_COLLECTION_ID");
export const EXAMINATION_COLLECTION_ID = () =>
  requireEnv("EXAMINATION_COLLECTION_ID");
export const OPENING_HOURS_COLLECTION_ID = () =>
  requireEnv("OPENING_HOURS_COLLECTION_ID");
export const CLOSED_DAYS_COLLECTION_ID = () =>
  requireEnv("CLOSED_DAYS_COLLECTION_ID");

export { ID, Query };

/** ---- Lazy singleton Appwrite client ---- */
let _client: Client | null = null;

export const getClient = (): Client => {
  if (_client) return _client;

  const { ENDPOINT, PROJECT_ID, API_KEY } = getCoreEnv();

  const c = new Client()
    .setEndpoint(ENDPOINT) // e.g. https://cloud.appwrite.io/v1
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  _client = c;
  return c;
};

export const getUsers = () => new Users(getClient());
export const getDatabases = () => new Databases(getClient());
export const getStorage = () => new Storage(getClient());

/** Opsiyonel: tek seferde hepsi */
export const appwrite = () => {
  const client = getClient();
  return {
    client,
    users: new Users(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
};
