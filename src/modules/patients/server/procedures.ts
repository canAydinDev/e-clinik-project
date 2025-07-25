import {
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  NEXT_PUBLIC_BUCKET_ID,
  NEXT_PUBLIC_ENDPOINT,
  databases,
  storage,
  users,
  ID,
  Query,
} from "@/lib/server/appwrite"; // ← InputFile kaldırıldı
import { parseStringify } from "@/lib/utils";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Patient } from "../../../../types/form";

export const patientsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async (): Promise<Patient[]> => {
    try {
      const patients = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!
      );
      return parseStringify(patients.documents) as Patient[];
    } catch (error) {
      console.log("Tüm hastaları getirirken hata:", error);
      return [];
    }
  }),
});
