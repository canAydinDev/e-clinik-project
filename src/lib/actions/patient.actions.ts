"use server";

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

import { API_KEY } from "../appwrite.config";
import { parseStringify } from "../utils";
import { Users, Client, Account } from "node-appwrite";

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      user.password,
      user.name
    );
    return newUser;
  } catch (error) {
    if (error && error?.code === 409) {
      const document = await users.list([Query.equal("email", [user.email])]);
      return document?.users[0];
    }
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(client);

    const result = await users.list([], username);

    const user = result.users.find((user) => user.name === username);

    return user || null;
  } catch (error) {
    console.error("Kullanıcı getirme hatası:", error);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const allUsers = await users.list();
    return parseStringify(allUsers);
  } catch (error) {
    console.log(error);
  }
};
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("patientId", userId)]
    );

    if (patients.documents.length === 0) {
      return null; // ❗ Hasta yoksa null dön
    }

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.log(error);
    return null; // ❗ Hata durumunda null dön
  }
};

export const getPatientById = async (documentId: string) => {
  try {
    const patient = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      documentId // 🔥 Doğrudan document ID ile sorguluyorsun
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
  try {
    let fileResponse;

    // Dosya varsa Appwrite REST API ile yükle
    if (face) {
      const fileBlob = face.get("blobFile") as File;
      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = face.get("fileName") as string;

      // 🔥 Tip uyumsuzluk olmaması için buffer'ı Blob içine sarıyoruz
      const blob = new Blob([buffer], { type: fileBlob.type });

      const form = new FormData();
      form.append("fileId", "unique()");
      form.append("file", blob, fileName); // ✅ artık geçerli

      const res = await fetch(
        `${NEXT_PUBLIC_ENDPOINT}/storage/buckets/${NEXT_PUBLIC_BUCKET_ID}/files`,
        {
          method: "POST",
          headers: {
            "X-Appwrite-Project": PROJECT_ID!,
            "X-Appwrite-Key": API_KEY!,
          },
          body: form,
        }
      );

      fileResponse = await res.json();
    }

    // Hasta kaydını oluştur
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        faceId: fileResponse?.$id || null,
        faceUrl: fileResponse?.$id
          ? `${NEXT_PUBLIC_ENDPOINT}/storage/buckets/${NEXT_PUBLIC_BUCKET_ID}/files/${fileResponse.$id}/view?project=${PROJECT_ID}`
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
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!
    );

    return parseStringify(patients.documents);
  } catch (error) {
    console.log("Tüm hastaları getirirken hata:", error);
    return [];
  }
};

export const updatePatient = async (documentId: string, updatedData: any) => {
  try {
    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      documentId,
      updatedData // 🔥 Sadece değişecek alanları gönder
    );

    return parseStringify(updatedPatient);
  } catch (error) {
    console.log("Hasta güncellenirken hata:", error);
    return null;
  }
};

export const deletePatient = async (documentId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      documentId
    );

    return true; // ✅ Başarıyla silindiyse true döner
  } catch (error) {
    console.log("Hasta silinirken hata:", error);
    return false;
  }
};
