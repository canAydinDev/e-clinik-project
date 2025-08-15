"use server";

import {
  getDatabases,
  DATABASE_ID,
  ID,
  Query,
  APPOINTMENT_COLLECTION_ID,
} from "@/lib/server/appwrite";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import { parseStringify } from "../utils";
import { Appointment } from "../../../types/appwrite.types";

import { addMinutes, setMilliseconds, setSeconds } from "date-fns";

export type CreateAppointmentParams = {
  userId: string;
  patient: string;
  reason: string;
  schedule: Date; // UTC Date
  durationMin: number; // dk
  status: "scheduled" | "pending" | "cancelled" | "completed";
  note?: string;
  cancellationReason?: string;
};

export type CreateAppointmentResult =
  | Appointment
  | { error: "SLOT_TAKEN" | "UNKNOWN" };

// ISO içindeki uygunsuz karakterleri sadeleştir
const docIdFromStart = (startUtc: Date): string =>
  `apt_${startUtc.toISOString().replace(/[^a-zA-Z0-9_-]/g, "-")}`;

/**
 * Basit create (ID.unique ile)
 * Eğer bunu kullanacaksan getDatabases / env getter'larına uyarladım.
 */
export const createAppointment2 = async (
  appointment: CreateAppointmentParams
) => {
  const databases = getDatabases();
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID(),
      APPOINTMENT_COLLECTION_ID(),
      ID.unique(),
      appointment
    );

    return parseStringify(newAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const createAppointment = async (
  params: CreateAppointmentParams
): Promise<CreateAppointmentResult> => {
  const databases = getDatabases();

  // dakika hizası
  const start = setMilliseconds(setSeconds(new Date(params.schedule), 0), 0);
  const end = addMinutes(start, params.durationMin);
  const docId = docIdFromStart(start);

  const payload = {
    patient: params.patient,
    userId: params.userId,
    reason: params.reason,
    schedule: start.toISOString(),
    end: end.toISOString(),
    durationMin: params.durationMin,
    status: params.status,
    note: params.note ?? "",
    cancellationReason: params.cancellationReason ?? "",
  };

  try {
    const created = await databases.createDocument(
      DATABASE_ID(),
      APPOINTMENT_COLLECTION_ID(),
      docId,
      payload
    );
    return parseStringify(created) as Appointment;
  } catch (e: unknown) {
    const err = e as { code?: number };

    // 409 => aynı docId zaten var
    if (err?.code === 409) {
      try {
        const existing = await databases.getDocument(
          DATABASE_ID(),
          APPOINTMENT_COLLECTION_ID(),
          docId
        );

        // iptal edilmişse revive et
        if ((existing as { status?: string })?.status === "cancelled") {
          const revived = await databases.updateDocument(
            DATABASE_ID(),
            APPOINTMENT_COLLECTION_ID(),
            docId,
            {
              patient: params.patient,
              userId: params.userId,
              reason: params.reason,
              schedule: start.toISOString(),
              end: end.toISOString(),
              durationMin: params.durationMin,
              status: "scheduled",
              note: params.note ?? "",
              cancellationReason: "",
            }
          );
          return parseStringify(revived) as Appointment;
        }
      } catch {
        // get/update hatası → UNKNOWN'a düşer
      }
      return { error: "SLOT_TAKEN" };
    }

    console.error(e);
    return { error: "UNKNOWN" };
  }
};

export async function cancelAppointment(appointmentId: string, reason = "") {
  const databases = getDatabases();

  const updated = await databases.updateDocument(
    DATABASE_ID(),
    APPOINTMENT_COLLECTION_ID(),
    appointmentId,
    { status: "cancelled", cancellationReason: reason }
  );

  // Tablo sayfalarını yenile
  revalidatePath("/admin/appointments", "page");
  // revalidatePath(`/admin/patient/${patientId}`, "page"); // gerekiyorsa

  return updated;
}

export const getAppointment = async (appointmentId: string) => {
  const databases = getDatabases();

  try {
    const appointment = await databases.getDocument(
      DATABASE_ID(),
      APPOINTMENT_COLLECTION_ID(),
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.log(error);
  }
};

export const getRecentAppointmentList = async () => {
  const databases = getDatabases();
  noStore();
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID(),
      APPOINTMENT_COLLECTION_ID(),
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

export type UpdateAppointmentParams = {
  userId: string;
  appointmentId: string;
  appointment: Partial<{
    schedule: Date | string;
    status: "scheduled" | "pending" | "cancelled" | "completed";
    reason: string;
    note: string;
    cancellationReason: string;
    durationMin: number;
  }>;
  revalidatePaths?: string[];
};

export const updateAppointment = async ({
  appointmentId,
  appointment,
  revalidatePaths,
}: UpdateAppointmentParams) => {
  const databases = getDatabases();

  try {
    // 1) Mevcut randevuyu al (durationMin ve diğer alanlara erişmek için)
    const existing = (await databases.getDocument(
      DATABASE_ID(),
      APPOINTMENT_COLLECTION_ID(),
      appointmentId
    )) as unknown as Appointment;

    // 2) Yeni başlangıç ve bitişi hazırla (schedule verilmişse)
    let scheduleISO: string | undefined;
    let endISO: string | undefined;
    const duration = appointment.durationMin ?? existing.durationMin ?? 30;

    if (appointment.schedule) {
      const start = setMilliseconds(
        setSeconds(new Date(appointment.schedule), 0),
        0
      );
      scheduleISO = start.toISOString();
      endISO = addMinutes(start, duration).toISOString();

      // 3) ÇAKIŞMA KONTROLÜ:
      const sameStart = await databases.listDocuments(
        DATABASE_ID(),
        APPOINTMENT_COLLECTION_ID(),
        [Query.equal("schedule", scheduleISO), Query.limit(2)]
      );

      const hasConflict = (sameStart.documents as Appointment[]).some(
        (doc) => doc.$id !== appointmentId && doc.status !== "cancelled"
      );

      if (hasConflict) {
        return { error: "SLOT_TAKEN" } as const;
      }
    }

    // 4) Güncellenecek payload’u kur
    const payload: Record<string, unknown> = {
      ...appointment,
    };
    if (scheduleISO) {
      payload.schedule = scheduleISO;
      payload.end = endISO;
      payload.durationMin = duration;
    }

    // 5) Güncelle
    const updated = await databases.updateDocument(
      DATABASE_ID(),
      APPOINTMENT_COLLECTION_ID(),
      appointmentId,
      payload
    );

    if (!updated) {
      throw new Error("Randevu bulunamadı");
    }

    // 6) DOĞRU SAYFALARI revalidate ET
    const paths = revalidatePaths ?? [
      "/admin/appointments",
      // `/admin/patient/${existing.patient}`,
    ];
    paths.forEach((p) => revalidatePath(p, "page"));

    return parseStringify(updated);
  } catch (error) {
    console.log(error);
    return { error: "UNKNOWN" } as const;
  }
};
