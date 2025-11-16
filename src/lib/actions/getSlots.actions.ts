// lib/server/getSlots.actions.ts (sizdeki yolu koruyun)
"use server";

import {
  getDatabases,
  DATABASE_ID,
  APPOINTMENT_COLLECTION_ID,
  OPENING_HOURS_COLLECTION_ID,
  CLOSED_DAYS_COLLECTION_ID,
  PATIENT_COLLECTION_ID,
  Query,
} from "@/lib/server/appwrite";

import { addMinutes, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TZ = "Europe/Istanbul";
const SLOT_STEP_MIN = 15;

type OpeningHoursDoc = {
  $id: string;
  weekday: number;
  open: string;
  close: string;
};
type Slot = { start: string; end: string; label: string };
type Block = { start: Date; end: Date };

type AppointmentDoc = {
  $id: string;
  patient?: string | { $id?: string; name?: string };
  schedule: string;
  end?: string;
  durationMin?: number;
  reason?: string;
  status?: string;
};

type DayContext = {
  workStartUtc: Date;
  workEndUtc: Date;
  dayStartUtc: Date;
  appointments: Array<AppointmentDoc & { start: Date; end: Date }>;
};

export type DayScheduleSlot = {
  start: string;
  end: string;
  label: string;
  status: "free" | "booked";
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  reason?: string;
};

export type DayScheduleResponse = {
  timezone: string;
  openingLabel: string | null;
  closingLabel: string | null;
  slots: DayScheduleSlot[];
};

// HH:mm → dakika (güvenli)
const parseHHMM = (s: string): number => {
  const [hhRaw, mmRaw] = s.split(":");
  const hh = Number(hhRaw ?? "0");
  const mm = Number(mmRaw ?? "0");
  return hh * 60 + mm;
};

// En yakın step'e (dk) YUKARI yuvarla
const roundUpToStep = (d: Date, stepMin: number) => {
  const stepMs = stepMin * 60_000;
  const rounded = Math.ceil(d.getTime() / stepMs) * stepMs;
  return new Date(rounded);
};

const overlaps = (a: Block, b: Block) =>
  !(a.end <= b.start || a.start >= b.end);

const isSameLocalDay = (aUtc: Date, bUtc: Date) => {
  const a = toZonedTime(aUtc, TZ);
  const b = toZonedTime(bUtc, TZ);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const buildDayContext = async (
  dateStr: string,
  fallbackDurationMin?: number
): Promise<DayContext | null> => {
  const databases = getDatabases();
  const dbId = DATABASE_ID();
  const closedDaysCol = CLOSED_DAYS_COLLECTION_ID();
  const openingHoursCol = OPENING_HOURS_COLLECTION_ID();
  const appointmentCol = APPOINTMENT_COLLECTION_ID();

  const dayStartUtc = fromZonedTime(`${dateStr} 00:00:00`, TZ);
  const dayEndUtc = addMinutes(dayStartUtc, 24 * 60);

  const closed = await databases.listDocuments(dbId, closedDaysCol, [
    Query.equal("date", dateStr),
  ]);
  if (closed.total > 0) return null;

  const localDayStart = toZonedTime(dayStartUtc, TZ);
  const js = localDayStart.getDay();
  const weekday = ((js + 6) % 7) + 1;

  const ohRes = await databases.listDocuments(dbId, openingHoursCol, [
    Query.equal("weekday", weekday),
  ]);
  const ohDoc = (ohRes.documents?.[0] ??
    null) as unknown as Partial<OpeningHoursDoc> | null;

  if (
    !ohDoc ||
    typeof ohDoc.open !== "string" ||
    typeof ohDoc.close !== "string"
  ) {
    return null;
  }

  const workStartUtc = addMinutes(dayStartUtc, parseHHMM(ohDoc.open));
  const workEndUtc = addMinutes(dayStartUtc, parseHHMM(ohDoc.close));
  if (workEndUtc <= workStartUtc) return null;

  const appts = await databases.listDocuments(dbId, appointmentCol, [
    Query.between(
      "schedule",
      dayStartUtc.toISOString(),
      dayEndUtc.toISOString()
    ),
    Query.notEqual("status", "cancelled"),
    Query.orderAsc("schedule"),
  ]);

  const appointments = (appts.documents as unknown as AppointmentDoc[]).map(
    (doc) => {
      const start = new Date(doc.schedule);
      const end = doc.end
        ? new Date(doc.end)
        : addMinutes(
            start,
            doc.durationMin ?? fallbackDurationMin ?? SLOT_STEP_MIN
          );
      return { ...doc, start, end };
    }
  );

  return { workStartUtc, workEndUtc, dayStartUtc, appointments };
};

export async function getAvailableSlotsForDayAction(
  dateStr: string, // "YYYY-MM-DD" (yerel)
  durationMin: number
): Promise<Slot[]> {
  const context = await buildDayContext(dateStr, durationMin);
  if (!context) return [];

  const { workStartUtc, workEndUtc, dayStartUtc, appointments } = context;
  const busy = appointments
    .map<Block>(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // 6) Bugün ise, 'şu an'ı (TZ) step'e yuvarla ve minimumu yükselt
  const nowUtcRounded = fromZonedTime(
    roundUpToStep(toZonedTime(new Date(), TZ), SLOT_STEP_MIN),
    TZ
  );

  const minStartUtc = isSameLocalDay(dayStartUtc, nowUtcRounded)
    ? new Date(Math.max(workStartUtc.getTime(), nowUtcRounded.getTime()))
    : workStartUtc;

  // 7) Slot üret
  const slots: Slot[] = [];
  for (
    let cur = new Date(minStartUtc);
    isBefore(cur, workEndUtc);
    cur = addMinutes(cur, SLOT_STEP_MIN)
  ) {
    const cand = { start: new Date(cur), end: addMinutes(cur, durationMin) };
    if (cand.end > workEndUtc) break;
    if (busy.some((b) => overlaps(cand, b))) continue;

    const local = toZonedTime(cand.start, TZ);
    const label = local.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    slots.push({
      start: cand.start.toISOString(),
      end: cand.end.toISOString(),
      label,
    });
  }

  return slots;
}

export async function getDayScheduleAction(
  dateStr: string
): Promise<DayScheduleResponse> {
  const context = await buildDayContext(dateStr);
  if (!context) {
    return {
      timezone: TZ,
      openingLabel: null,
      closingLabel: null,
      slots: [],
    };
  }

  const databases = getDatabases();
  const patientIds = Array.from(
    new Set(
      context.appointments
        .map((apt) =>
          typeof apt.patient === "string"
            ? apt.patient
            : (apt.patient as { $id?: string })?.$id
        )
        .filter((v): v is string => Boolean(v))
    )
  );

  const patientNames = new Map<string, string>();
  if (patientIds.length > 0) {
    const res = await databases.listDocuments(
      DATABASE_ID(),
      PATIENT_COLLECTION_ID(),
      [Query.equal("$id", patientIds), Query.limit(patientIds.length)]
    );
    res.documents.forEach((doc) => {
      patientNames.set(
        String(doc.$id),
        typeof (doc as { name?: unknown }).name === "string"
          ? ((doc as { name?: string }).name ?? "Bilinmeyen")
          : "Bilinmeyen"
      );
    });
  }

  const slots: DayScheduleSlot[] = [];
  for (
    let cur = new Date(context.workStartUtc);
    isBefore(cur, context.workEndUtc);
    cur = addMinutes(cur, SLOT_STEP_MIN)
  ) {
    const slotEnd = addMinutes(cur, SLOT_STEP_MIN);
    if (slotEnd > context.workEndUtc) break;

    const overlapping = context.appointments.find((apt) =>
      overlaps(
        {
          start: cur,
          end: slotEnd,
        },
        { start: apt.start, end: apt.end }
      )
    );

    const local = toZonedTime(cur, TZ);
    const label = local.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (overlapping) {
      const patientId =
        typeof overlapping.patient === "string"
          ? overlapping.patient
          : (overlapping.patient as { $id?: string })?.$id;
      const patientNameFromDoc =
        typeof overlapping.patient === "object" &&
        overlapping.patient !== null &&
        "name" in overlapping.patient
          ? String((overlapping.patient as { name?: unknown }).name ?? "")
          : undefined;

      slots.push({
        start: cur.toISOString(),
        end: slotEnd.toISOString(),
        label,
        status: "booked",
        appointmentId: overlapping.$id,
        reason: overlapping.reason,
        patientId,
        patientName:
          patientNameFromDoc ||
          (patientId ? patientNames.get(patientId) : undefined) ||
          "Rezerve",
      });
    } else {
      slots.push({
        start: cur.toISOString(),
        end: slotEnd.toISOString(),
        label,
        status: "free",
      });
    }
  }

  const openingLabel = toZonedTime(context.workStartUtc, TZ).toLocaleTimeString(
    "tr-TR",
    { hour: "2-digit", minute: "2-digit" }
  );
  const closingLabel = toZonedTime(context.workEndUtc, TZ).toLocaleTimeString(
    "tr-TR",
    { hour: "2-digit", minute: "2-digit" }
  );

  return {
    timezone: TZ,
    openingLabel,
    closingLabel,
    slots,
  };
}
