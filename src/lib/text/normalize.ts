// src/lib/text/normalize.ts
export function normalizeTR(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // diakritikleri temizle
    .toLocaleLowerCase("tr");
}

export type PatientSearchParts = {
  name?: string;
  email?: string;
  phone?: string;
  identificationNumber?: string;
  address?: string;
};

export function buildPatientSearchText(p: PatientSearchParts): string {
  const parts = [
    p.name,
    p.email,
    p.phone,
    p.identificationNumber,
    p.address,
  ].filter((v): v is string => !!v && v.trim().length > 0);

  return normalizeTR(parts.join(" "));
}

// src/lib/text/normalize.ts
export function toISO(d?: string | Date | null): string | undefined {
  if (!d) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
}
