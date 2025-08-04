import {
  DATABASE_ID,
  EXAMINATION_COLLECTION_ID,
  databases,
  Query,
} from "@/lib/server/appwrite";

import { parseStringify } from "@/lib/utils";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { Examination } from "../../../../types/form";

export const examinationsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async (): Promise<Examination[]> => {
    try {
      const examinations = await databases.listDocuments(
        DATABASE_ID!,
        EXAMINATION_COLLECTION_ID!
      );
      return parseStringify(examinations.documents) as Examination[];
    } catch (error) {
      console.error("Muayeneleri getirirken hata:", error);
      return [];
    }
  }),

  getManyByPatientId: baseProcedure
    .input(z.string()) // patientId
    .query(async ({ input: patientId }): Promise<Examination[]> => {
      try {
        const examinations = await databases.listDocuments(
          DATABASE_ID!,
          EXAMINATION_COLLECTION_ID!,
          [Query.equal("patientId", [patientId]), Query.orderDesc("date")]
        );

        return parseStringify(examinations.documents) as Examination[];
      } catch (error) {
        console.error("Hasta ID'ye göre muayeneler getirilirken hata:", error);
        return [];
      }
    }),
});
