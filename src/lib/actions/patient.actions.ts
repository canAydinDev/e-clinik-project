// lib/server/patient.actions.ts
"use server";

import {
  getDatabases,
  getUsers,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  ID,
  Query,
} from "@/lib/server/appwrite";
import { API_KEY } from "../appwrite.config";
import { parseStringify } from "../utils";

/* =====================
   Tipler (minimal)
   ===================== */
export interface CreateUserParams {
  email: string;
  phone?: string | null;
  password: string;
  name: string;
}

export type RegisterUserParams = {
  /** Yüz fotoğrafı yüklemek için opsiyonel FormData */
  face?: FormData | null;
} & Record<string, unknown>;

export interface PatientUpdate {
  name?: string;
  age?: number;
  address?: string;
  // ihtiyaca göre alan ekleyin...
}

type UploadedFileResponse = { $id: string } & Record<string, unknown>;

/* =====================
   Users (Appwrite Users)
   ===================== */
export const createUser = async (user: CreateUserParams) => {
  const users = getUsers();
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone ?? undefined,
      user.password,
      user.name
    );
    return newUser;
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async (userId: string) => {
  const users = getUsers();
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  }
};

export const getUserByUsername = async (username: string) => {
  const users = getUsers();
  try {
    // node-appwrite: Users.list(queries?, search?)
    const result = await users.list([], username);
    const user = result.users.find((u) => u.name === username);
    return user || null;
  } catch (error) {
    console.error("Kullanıcı getirme hatası:", error);
    return null;
  }
};

export const getAllUsers = async () => {
  const users = getUsers();
  try {
    const allUsers = await users.list();
    return parseStringify(allUsers);
  } catch (error) {
    console.log(error);
  }
};

/* =====================
   Patients (Databases)
   ===================== */
export const getPatient = async (userId: string) => {
  const databases = getDatabases();
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      [Query.equal("patientId", userId)]
    );

    if (patients.documents.length === 0) {
      return null;
    }
    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPatientById = async (documentId: string) => {
  const databases = getDatabases();
  try {
    const patient = await databases.getDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      documentId
    );
    return patient;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const registerPatient = async ({
  face,
  ...patient
}: RegisterUserParams) => {
  const databases = getDatabases();

  try {
    let fileResponse: UploadedFileResponse | undefined;

    // Dosya varsa Appwrite REST API ile yükle
    if (face) {
      const fileBlob = face.get("blobFile") as File | null;
      const fileName = (face.get("fileName") as string | null) ?? "face.jpg";

      if (fileBlob) {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const blob = new Blob([buffer], { type: fileBlob.type });

        const form = new FormData();
        form.append("fileId", "unique()");
        form.append("file", blob, fileName);

        const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;
        const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID!;
        const PROJECT_ID = process.env.PROJECT_ID!;

        const res = await fetch(
          `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`,
          {
            method: "POST",
            headers: {
              "X-Appwrite-Project": PROJECT_ID,
              "X-Appwrite-Key": API_KEY!,
            },
            body: form,
          }
        );

        fileResponse = (await res.json()) as UploadedFileResponse;
      }
    }

    // Hasta kaydını oluştur
    const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;
    const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID!;
    const PROJECT_ID = process.env.PROJECT_ID!;

    const newPatient = await databases.createDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      ID.unique(),
      {
        faceId: fileResponse?.$id ?? null,
        faceUrl: fileResponse?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
  }
};

export const getAllPatients = async () => {
  const databases = getDatabases();
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID()
    );

    return parseStringify(patients.documents);
  } catch (error) {
    console.log("Tüm hastaları getirirken hata:", error);
    return [];
  }
};

export const updatePatient = async (
  documentId: string,
  updatedData: PatientUpdate
) => {
  const databases = getDatabases();
  try {
    const updatedPatient = await databases.updateDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      documentId,
      updatedData as Record<string, unknown>
    );

    return parseStringify(updatedPatient);
  } catch (error) {
    console.log("Hasta güncellenirken hata:", error);
    return null;
  }
};

export const deletePatient = async (documentId: string) => {
  const databases = getDatabases();
  try {
    await databases.deleteDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      documentId
    );

    return true;
  } catch (error) {
    console.log("Hasta silinirken hata:", error);
    return false;
  }
};
