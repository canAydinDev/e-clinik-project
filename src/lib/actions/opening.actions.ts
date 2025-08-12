"use server";

import { databases, DATABASE_ID } from "@/lib/server/appwrite";
import { Query } from "appwrite";
import { addMonths, format } from "date-fns";

const OPENING_HOURS_COLLECTION_ID = process.env.OPENING_HOURS_COLLECTION_ID!;
const CLOSED_DAYS_COLLECTION_ID = process.env.CLOSED_DAYS_COLLECTION_ID!;

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
  const res = await databases.listDocuments(
    DATABASE_ID!, // <-- non-null assertion
    OPENING_HOURS_COLLECTION_ID!,
    [Query.equal("weekday", weekday)]
  );
  // Appwrite dönen dokümanları tipli almak için iki yaklaşım:
  // 1) (SDK destekliyorsa) generic: listDocuments<OpeningHour>(...)
  // 2) Güvenli daraltma (aşağıdaki gibi)
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
  // Ayın ilk günü
  const startStr = `${year}-${pad2(month)}-01`;
  // Bir sonraki ayın ilk günü (exclusive üst sınır için)
  const nextMonthFirst = addMonths(new Date(`${startStr}T00:00:00Z`), 1);
  const nextStr = format(nextMonthFirst, "yyyy-MM-dd");

  const res = await databases.listDocuments(
    DATABASE_ID!,
    CLOSED_DAYS_COLLECTION_ID!,
    [
      Query.greaterThanEqual("date", startStr),
      Query.lessThan("date", nextStr),
      Query.orderAsc("date"),
    ]
  );

  // Güvenli daraltma (SDK generic yoksa)
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
  const existing = await getOpeningHoursByWeekday(weekday);
  if (existing) {
    return databases.updateDocument(
      DATABASE_ID!,
      OPENING_HOURS_COLLECTION_ID!,
      existing.$id,
      { open, close }
    );
  }
  return databases.createDocument(
    DATABASE_ID!,
    OPENING_HOURS_COLLECTION_ID!,
    `wh_${weekday}`,
    { weekday, open, close }
  );
}

export async function closeDay(dateStr: string) {
  return databases.createDocument(
    DATABASE_ID!,
    CLOSED_DAYS_COLLECTION_ID!,
    `cd_${dateStr}`,
    { date: dateStr }
  );
}

export async function openDay(dateStr: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      CLOSED_DAYS_COLLECTION_ID!,
      `cd_${dateStr}`
    );
  } catch (e: unknown) {
    console.log(e);
    // yoksa sorun değil
  }
}
