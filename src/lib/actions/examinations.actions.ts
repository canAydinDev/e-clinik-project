// lib/server/examination.actions.ts
"use server";

import {
  getDatabases,
  DATABASE_ID,
  EXAMINATION_COLLECTION_ID,
  ID,
  Query,
} from "@/lib/server/appwrite";
import { parseStringify } from "@/lib/utils";

// ---- Tipler ----
export type Examination = {
  $id: string;
  patientId: string;
  procedure: string;
  date: string; // ISO
  doctorNote?: string | null;
  nextControlDate?: string | null;
};

type ExaminationCreateInput = {
  patientId: string;
  procedure: string;
  date?: Date;
  doctorNote?: string;
  nextControlDate?: Date;
};

type ExaminationUpdateInput = Partial<{
  procedure: string;
  date: Date;
  doctorNote?: string;
  nextControlDate?: Date;
}>;

// 1) Muayene oluşturma
export const createExamination = async (
  examinationData: ExaminationCreateInput
) => {
  const databases = getDatabases();

  try {
    const payload: Omit<Examination, "$id"> = {
      patientId: examinationData.patientId,
      procedure: examinationData.procedure,
      date: (examinationData.date ?? new Date()).toISOString(),
      doctorNote: examinationData.doctorNote ?? null,
      nextControlDate: examinationData.nextControlDate
        ? examinationData.nextControlDate.toISOString()
        : null,
    };

    const newExamination = await databases.createDocument(
      DATABASE_ID(),
      EXAMINATION_COLLECTION_ID(),
      ID.unique(),
      payload
    );

    return parseStringify(newExamination) as Examination;
  } catch (error) {
    console.error("Muayene oluşturulurken hata:", error);
    return null;
  }
};

// 2) Muayene ID ile getir
export const getExaminationByExamId = async (examinationId: string) => {
  const databases = getDatabases();

  try {
    const result = await databases.getDocument(
      DATABASE_ID(),
      EXAMINATION_COLLECTION_ID(),
      examinationId
    );

    const exam = parseStringify(result) as Examination;
    return exam;
  } catch (error) {
    console.error("Muayene ID ile getirilirken hata:", error);
    return null;
  }
};

// 3) Muayene güncelleme
export const updateExamination = async (
  examinationId: string,
  updatedData: ExaminationUpdateInput
) => {
  const databases = getDatabases();

  try {
    const payload: Partial<Omit<Examination, "$id">> = {};

    if (typeof updatedData.procedure === "string") {
      payload.procedure = updatedData.procedure;
    }
    if (updatedData.date instanceof Date) {
      payload.date = updatedData.date.toISOString();
    }
    if ("doctorNote" in updatedData) {
      payload.doctorNote =
        typeof updatedData.doctorNote === "string"
          ? updatedData.doctorNote
          : null;
    }
    if ("nextControlDate" in updatedData) {
      payload.nextControlDate = updatedData.nextControlDate
        ? updatedData.nextControlDate.toISOString()
        : null;
    }

    const updatedExamination = await databases.updateDocument(
      DATABASE_ID(),
      EXAMINATION_COLLECTION_ID(),
      examinationId,
      payload
    );

    return parseStringify(updatedExamination) as Examination;
  } catch (error) {
    console.error("Muayene güncellenirken hata:", error);
    return null;
  }
};

// 4) Muayene silme
export const deleteExamination = async (examinationId: string) => {
  const databases = getDatabases();

  try {
    await databases.deleteDocument(
      DATABASE_ID(),
      EXAMINATION_COLLECTION_ID(),
      examinationId
    );
    return true;
  } catch (error) {
    console.error("Muayene silinirken hata:", error);
    return false;
  }
};

// 5) Hastaya göre muayeneleri listele
export const getExaminationsByPatientId = async (patientId: string) => {
  const databases = getDatabases();

  try {
    const results = await databases.listDocuments(
      DATABASE_ID(),
      EXAMINATION_COLLECTION_ID(),
      [
        // Appwrite sürümüne göre tek değer ya da dizi kabul edilebilir
        Query.equal("patientId", [patientId]),
        Query.orderDesc("date"),
      ]
    );

    return parseStringify(results.documents) as Examination[];
  } catch (error) {
    console.error("Muayeneler getirilirken hata:", error);
    return [];
  }
};
