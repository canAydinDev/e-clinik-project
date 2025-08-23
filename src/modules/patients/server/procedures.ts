import { z } from "zod";
import { normalizeTR } from "@/lib/text/normalize";

import {
  getDatabases,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
} from "@/lib/server/appwrite";
import { parseStringify } from "@/lib/utils";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { Patient } from "../../../../types/form";
import { Query } from "appwrite";

export const patientsRouter = createTRPCRouter({
  getMany2: baseProcedure.query(async (): Promise<Patient[]> => {
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

  getMany: baseProcedure
    .input(
      z
        .object({
          q: z.string().trim().optional(),
          limit: z.number().min(1).max(200).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const databases = getDatabases();
      const q = input?.q;
      const limit = input?.limit ?? 50;

      const filters = [Query.orderDesc("$createdAt"), Query.limit(limit)];

      if (q && q.length > 0) {
        filters.unshift(Query.search("searchText", normalizeTR(q)));
      }

      const res = await databases.listDocuments(
        DATABASE_ID(),
        PATIENT_COLLECTION_ID(),
        filters
      );

      const asStr = (v: unknown): string => (typeof v === "string" ? v : "");

      const items: Patient[] = res.documents.map((d) => ({
        $id: String(d.$id),
        name: asStr((d as { name?: unknown }).name),
        email: asStr((d as { email?: unknown }).email),
        phone: asStr((d as { phone?: unknown }).phone),
        faceUrl: asStr((d as { faceUrl?: unknown }).faceUrl), // <-- EKLENDİ
        // Patient tipinizde başka "required" alanlar da varsa, onları da aynı şekilde ekleyin
      }));

      return items;
    }),
});
