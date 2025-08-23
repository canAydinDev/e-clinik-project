// lib/server/patient.actions.ts
"use server";

import { buildPatientSearchText, toISO } from "@/lib/text/normalize";

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

export const registerPatient2 = async ({
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

export const registerPatient = async ({
  face,
  ...patient
}: RegisterUserParams) => {
  const databases = getDatabases();

  try {
    let fileResponse: UploadedFileResponse | undefined;

    // --- (mevcut) dosya yükleme bloğun aynı kalsın ---
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

    // --- searchText için güvenli alan çekimi (RegisterUserParams unknown içeriyor olabilir) ---
    const name = typeof patient.name === "string" ? patient.name : undefined;
    const email = typeof patient.email === "string" ? patient.email : undefined;
    const phone = typeof patient.phone === "string" ? patient.phone : undefined;
    const identificationNumber =
      typeof patient.identificationNumber === "string"
        ? patient.identificationNumber
        : undefined;
    const address =
      typeof patient.address === "string" ? patient.address : undefined;
    const userId =
      typeof patient.userId === "string" ? patient.userId : undefined;
    const birthDateISO = toISO(
      (patient as { birthDate?: string | Date | null }).birthDate
    );

    // 1) searchText
    const searchText = buildPatientSearchText({
      name,
      email,
      phone,
      identificationNumber,
      address,
    });

    // 2) Appwrite'e gidecek doküman (yalnızca şemadaki alanlar)
    const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;
    const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID!;
    const PROJECT_ID = process.env.PROJECT_ID!;

    const docPayload: Record<string, unknown> = {
      faceId: fileResponse?.$id ?? null,
      faceUrl: fileResponse?.$id
        ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${PROJECT_ID}`
        : null,

      // şema alanları
      userId, // required ise undefined kalmamasına dikkat et
      name,
      phone,
      email,
      address,
      occupation:
        typeof patient.occupation === "string" ? patient.occupation : undefined,
      emergencyContactName:
        typeof patient.emergencyContactName === "string"
          ? patient.emergencyContactName
          : undefined,
      emergencyContactNumber:
        typeof patient.emergencyContactNumber === "string"
          ? patient.emergencyContactNumber
          : undefined,
      allergies:
        typeof patient.allergies === "string" ? patient.allergies : undefined,
      currentMedication:
        typeof patient.currentMedication === "string"
          ? patient.currentMedication
          : undefined,
      familyMedicalHistory:
        typeof patient.familyMedicalHistory === "string"
          ? patient.familyMedicalHistory
          : undefined,
      pastMedicalHistory:
        typeof patient.pastMedicalHistory === "string"
          ? patient.pastMedicalHistory
          : undefined,
      identificationNumber,
      birthDate: birthDateISO,

      // yeni alan
      searchText,
    };

    const newPatient = await databases.createDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      ID.unique(),
      docPayload
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

export const updatePatient2 = async (
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

export const updatePatient = async (
  documentId: string,
  updatedData: PatientUpdate
) => {
  const databases = getDatabases();
  try {
    // mevcut hasta
    const current = await databases.getDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      documentId
    );

    // güncellemede gelebilecek alanlar
    const nextName =
      typeof updatedData.name === "string"
        ? updatedData.name
        : (current.name as string | undefined);

    const nextEmail =
      typeof (updatedData as { email?: string }).email === "string"
        ? (updatedData as { email?: string }).email
        : (current.email as string | undefined);

    const nextPhone =
      typeof (updatedData as { phone?: string }).phone === "string"
        ? (updatedData as { phone?: string }).phone
        : (current.phone as string | undefined);

    const nextIdNo =
      typeof (updatedData as { identificationNumber?: string })
        .identificationNumber === "string"
        ? (updatedData as { identificationNumber?: string })
            .identificationNumber
        : (current.identificationNumber as string | undefined);

    const nextAddress =
      typeof (updatedData as { address?: string }).address === "string"
        ? (updatedData as { address?: string }).address
        : (current.address as string | undefined);

    // searchText tekrar
    const nextSearchText = buildPatientSearchText({
      name: nextName,
      email: nextEmail,
      phone: nextPhone,
      identificationNumber: nextIdNo,
      address: nextAddress,
    });

    // Appwrite update payload (yalnızca şemadaki anahtarlar)
    const payload: Record<string, unknown> = {
      ...(updatedData.name !== undefined ? { name: updatedData.name } : {}),
      ...(updatedData.address !== undefined
        ? { address: updatedData.address }
        : {}),
      ...(updatedData.age !== undefined ? { age: updatedData.age } : {}),

      // varsa diğer alanlarınız için benzer kontrol ekleyin…

      searchText: nextSearchText,
    };

    const updatedPatient = await databases.updateDocument(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      documentId,
      payload
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
