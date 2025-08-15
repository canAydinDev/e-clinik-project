// lib/server/opening-hours.actions.ts  (mevcut yolunuzu koruyun)
"use server";

import {
  getDatabases,
  DATABASE_ID,
  OPENING_HOURS_COLLECTION_ID,
  CLOSED_DAYS_COLLECTION_ID,
  Query,
} from "@/lib/server/appwrite";
import { addMonths, format } from "date-fns";

// Tipler
type OpeningHour = {
  $id: string;
  weekday: number;
  open: string;
  close: string;
};
type ClosedDay = { $id: string; date: string };

// ---- GET ----
export async function getOpeningHoursByWeekday(
  weekday: number
): Promise<OpeningHour | undefined> {
  const databases = getDatabases();
  const res = await databases.listDocuments(
    DATABASE_ID(),
    OPENING_HOURS_COLLECTION_ID(),
    [Query.equal("weekday", weekday)]
  );
  const doc = res.documents?.[0] as unknown as OpeningHour | undefined;
  return doc;
}

// YARDIMCI
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Seçilen yıl/ay için kapalı günleri döndürür.
 * `date` alanı "YYYY-MM-DD" string; lexicographic filtre güvenli.
 */
export async function listClosedDaysInMonth(
  year: number,
  month: number
): Promise<ClosedDay[]> {
  const databases = getDatabases();

  // Ayın ilk günü
  const startStr = `${year}-${pad2(month)}-01`;
  // Bir sonraki ayın ilk günü (exclusive üst sınır için)
  const nextMonthFirst = addMonths(new Date(`${startStr}T00:00:00Z`), 1);
  const nextStr = format(nextMonthFirst, "yyyy-MM-dd");

  const res = await databases.listDocuments(
    DATABASE_ID(),
    CLOSED_DAYS_COLLECTION_ID(),
    [
      Query.greaterThanEqual("date", startStr),
      Query.lessThan("date", nextStr),
      Query.orderAsc("date"),
    ]
  );

  const items = (res.documents ?? []) as unknown as Array<
    Partial<ClosedDay> & { $id: string }
  >;
  return items
    .filter((d): d is ClosedDay => typeof d.date === "string")
    .map((d) => ({ $id: d.$id, date: d.date! }));
}

// ---- SET (admin) ----
export async function setOpeningHours(
  weekday: number,
  open: string,
  close: string
) {
  const databases = getDatabases();

  const existing = await getOpeningHoursByWeekday(weekday);
  if (existing) {
    return databases.updateDocument(
      DATABASE_ID(),
      OPENING_HOURS_COLLECTION_ID(),
      existing.$id,
      { open, close }
    );
  }
  return databases.createDocument(
    DATABASE_ID(),
    OPENING_HOURS_COLLECTION_ID(),
    `wh_${weekday}`,
    { weekday, open, close }
  );
}

export async function closeDay(dateStr: string) {
  const databases = getDatabases();
  return databases.createDocument(
    DATABASE_ID(),
    CLOSED_DAYS_COLLECTION_ID(),
    `cd_${dateStr}`,
    { date: dateStr }
  );
}

export async function openDay(dateStr: string) {
  const databases = getDatabases();
  try {
    await databases.deleteDocument(
      DATABASE_ID(),
      CLOSED_DAYS_COLLECTION_ID(),
      `cd_${dateStr}`
    );
  } catch (e) {
    // kayıt yoksa sorun değil
    console.log(e);
  }
}
