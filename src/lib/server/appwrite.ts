import {
  Client,
  Users,
  Databases,
  Storage,
  ID,
  Query,
  InputFile,
} from "node-appwrite";

export const {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
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

export { client, users, databases, storage, ID, Query, InputFile };
