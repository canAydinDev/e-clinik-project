// src/lib/server/patient.search.ts
"use server";
import {
  getDatabases,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  Query,
} from "@/lib/server/appwrite";
import { normalizeTR } from "@/lib/text/normalize";

export type PatientListItem = {
  $id: string;
  name: string;
  phone?: string;
  email?: string;
  identificationNumber?: string;
  address?: string;
};

export async function searchPatients(q: string, limit = 20, cursor?: string) {
  const databases = getDatabases();
  const filters = [
    Query.search("searchText", normalizeTR(q.trim())),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (cursor) filters.push(Query.cursorAfter(cursor));

  const res = await databases.listDocuments(
    DATABASE_ID(),
    PATIENT_COLLECTION_ID(),
    filters
  );

  return {
    total: res.total,
    nextCursor: res.documents.at(-1)?.$id,
    items: res.documents.map((d) => ({
      $id: d.$id,
      name: d.name as string,
      phone: d.phone as string | undefined,
      email: d.email as string | undefined,
      identificationNumber: d.identificationNumber as string | undefined,
      address: d.address as string | undefined,
    })) as PatientListItem[],
  };
}
