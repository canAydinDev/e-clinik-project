export function asId(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const rec = val as Record<string, unknown>;
    const cand =
      (typeof rec.$id === "string" && rec.$id) ||
      (typeof rec.id === "string" && rec.id) ||
      (typeof rec.patientId === "string" && rec.patientId);
    if (cand) return cand;
  }
  throw new Error("Geçersiz patientId");
}
