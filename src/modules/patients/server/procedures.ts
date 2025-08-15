import {
  getDatabases,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
} from "@/lib/server/appwrite";
import { parseStringify } from "@/lib/utils";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { Patient } from "../../../../types/form";

export const patientsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async (): Promise<Patient[]> => {
    const databases = getDatabases();
    try {
      const patients = await databases.listDocuments(
        DATABASE_ID(),
        PATIENT_COLLECTION_ID()
      );
      return parseStringify(patients.documents) as Patient[];
    } catch (error) {
      console.log("Tüm hastaları getirirken hata:", error);
      return [];
    }
  }),
});
