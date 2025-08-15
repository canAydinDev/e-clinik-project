// lib/server/getSlots.actions.ts (sizdeki yolu koruyun)
"use server";

import {
  getDatabases,
  DATABASE_ID,
  APPOINTMENT_COLLECTION_ID,
  OPENING_HOURS_COLLECTION_ID,
  CLOSED_DAYS_COLLECTION_ID,
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

export async function getAvailableSlotsForDayAction(
  dateStr: string, // "YYYY-MM-DD" (yerel)
  durationMin: number
): Promise<Slot[]> {
  const databases = getDatabases();
  const dbId = DATABASE_ID();
  const closedDaysCol = CLOSED_DAYS_COLLECTION_ID();
  const openingHoursCol = OPENING_HOURS_COLLECTION_ID();
  const appointmentCol = APPOINTMENT_COLLECTION_ID();

  // 1) Yerel gün 00:00 → UTC
  const dayStartUtc = fromZonedTime(`${dateStr} 00:00:00`, TZ);
  const dayEndUtc = addMinutes(dayStartUtc, 24 * 60);

  // 2) Kapalı gün mü?
  const closed = await databases.listDocuments(dbId, closedDaysCol, [
    Query.equal("date", dateStr),
  ]);
  if (closed.total > 0) return [];

  // 3) Haftanın günü (1=Mon..7=Sun) ve opening_hours kaydını al
  const localDayStart = toZonedTime(dayStartUtc, TZ);
  const js = localDayStart.getDay(); // 0=Sun..6=Sat
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
    // O gün için kayıt yoksa slot üretilmez
    return [];
  }

  // 4) Çalışma aralığı (UTC)
  const workStartUtc = addMinutes(dayStartUtc, parseHHMM(ohDoc.open));
  const workEndUtc = addMinutes(dayStartUtc, parseHHMM(ohDoc.close));
  if (workEndUtc <= workStartUtc) return []; // kapalı veya geçersiz aralık

  // 5) Mevcut randevuları çek (iptaller hariç)
  const appts = await databases.listDocuments(dbId, appointmentCol, [
    Query.between(
      "schedule",
      dayStartUtc.toISOString(),
      dayEndUtc.toISOString()
    ),
    Query.notEqual("status", "cancelled"),
    Query.orderAsc("schedule"),
  ]);

  const busyFromAppointments: Block[] = (
    appts.documents as unknown as Array<{
      schedule: string;
      end?: string;
      durationMin?: number;
    }>
  ).map((d) => ({
    start: new Date(d.schedule),
    end: d.end
      ? new Date(d.end)
      : addMinutes(new Date(d.schedule), d.durationMin ?? durationMin),
  }));

  const busy = busyFromAppointments.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

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
