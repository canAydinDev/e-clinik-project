"use server";

import {
  DATABASE_ID,
  databases,
  ID,
  Query,
  APPOINTMENT_COLLECTION_ID,
} from "@/lib/server/appwrite";

import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "../../../types/appwrite.types";
import { revalidatePath } from "next/cache";
import { messaging } from "../appwrite.config";

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    return parseStringify(newAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.log(error);
  }
};

export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        if (appointment.status === "scheduled") {
          acc.scheduledCount += 1;
        } else if (appointment.status === "pending") {
          acc.pendingCount += 1;
        } else if (appointment.status === "cancelled") {
          acc.cancelledCount += 1;
        }

        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.log(error);
  }
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updateAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updateAppointment) {
      throw new Error("Randevu bulunamadi");
    }

    const SmsMessage = `
    BizimKlinikten Merhabalar
    ${
      type === "schedule"
        ? `Randevunuz ${
            formatDateTime(appointment.schedule!).dateTime
          } tarihinde Dr. ${appointment.reason} olarak planlandı.`
        : `Üzgünüz, randevunuz iptal edildi. İptal nedeni: ${appointment.cancellationReason}`
    }
`;

    await sendSMSNotification(userId, SmsMessage);

    revalidatePath("/admin");
    return parseStringify(updateAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.log(error);
  }
};
