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

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let fileResponse;

    // Dosya varsa Appwrite REST API ile yükle
    if (identificationDocument) {
      const fileBlob = identificationDocument.get("blobFile") as File;
      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = identificationDocument.get("fileName") as string;

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
        identificationDocumentId: fileResponse?.$id || null,
        identificationDocumentUrl: fileResponse?.$id
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
