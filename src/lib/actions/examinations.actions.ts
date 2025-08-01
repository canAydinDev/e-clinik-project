// lib/server/examination.actions.ts

"use server";

import {
  DATABASE_ID,
  EXAMINATION_COLLECTION_ID,
  databases,
  ID,
  Query,
} from "@/lib/server/appwrite";

import { parseStringify } from "@/lib/utils";

// 1. Muayene oluşturma
export const createExamination = async (examinationData: {
  patientId: string;
  procedure: string;
  date?: Date;
  doctorNote?: string;
  nextControlDate?: Date;
}) => {
  try {
    const newExamination = await databases.createDocument(
      DATABASE_ID!,
      EXAMINATION_COLLECTION_ID!,
      ID.unique(),
      {
        ...examinationData,
        date: (examinationData.date || new Date()).toISOString(),
        nextControlDate: examinationData.nextControlDate?.toISOString() || null,
      }
    );

    return parseStringify(newExamination);
  } catch (error) {
    console.error("Muayene oluşturulurken hata:", error);
    return null;
  }
};

// 2. Muayene güncelleme
export const updateExamination = async (
  examinationId: string,
  updatedData: Partial<{
    procedure: string;
    date: Date;
    doctorNote?: string;
    nextControlDate?: Date;
  }>
) => {
  try {
    const payload: any = { ...updatedData };
    if (updatedData.date) payload.date = updatedData.date.toISOString();
    if (updatedData.nextControlDate)
      payload.nextControlDate = updatedData.nextControlDate.toISOString();

    const updatedExamination = await databases.updateDocument(
      DATABASE_ID!,
      EXAMINATION_COLLECTION_ID!,
      examinationId,
      payload
    );

    return parseStringify(updatedExamination);
  } catch (error) {
    console.error("Muayene güncellenirken hata:", error);
    return null;
  }
};

// 3. Muayene silme
export const deleteExamination = async (examinationId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      EXAMINATION_COLLECTION_ID!,
      examinationId
    );

    return true;
  } catch (error) {
    console.error("Muayene silinirken hata:", error);
    return false;
  }
};

// 4. Belirli hastaya ait tüm muayeneleri çekme
export const getExaminationsByPatientId = async (patientId: string) => {
  try {
    const results = await databases.listDocuments(
      DATABASE_ID!,
      EXAMINATION_COLLECTION_ID!,
      [Query.equal("patientId", [patientId]), Query.orderDesc("date")]
    );

    return parseStringify(results.documents);
  } catch (error) {
    console.error("Muayeneler getirilirken hata:", error);
    return [];
  }
};
