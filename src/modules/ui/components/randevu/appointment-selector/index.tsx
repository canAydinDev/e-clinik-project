"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAvailableSlotsForDayAction } from "@/lib/actions/getSlots.actions";
import { createAppointment } from "@/lib/actions/appointment.actions";
import type { Appointment } from "../../../../../../types/appwrite.types";

const SERVICES = [
  { id: "botox", name: "Botoks", durationMin: 30 },
  { id: "prp", name: "PRP", durationMin: 45 },
] as const;

type Service = (typeof SERVICES)[number];
type SlotItem = { start: string; end: string; label: string };
type CreateAppointmentResult =
  | Appointment
  | { error: "SLOT_TAKEN" | "UNKNOWN" };

export function AppointmentSelector({
  patientId,
  userId,
}: {
  patientId: string;
  userId: string;
}) {
  const [date, setDate] = React.useState<Date>(new Date());
  const [serviceId, setServiceId] = React.useState<Service["id"]>(
    SERVICES[0].id
  );
  const [loading, setLoading] = React.useState(false);
  const [bookingStart, setBookingStart] = React.useState<string | null>(null);
  const [slots, setSlots] = React.useState<SlotItem[]>([]);

  const durationMin = React.useMemo(() => {
    const found = SERVICES.find((s) => s.id === serviceId);
    return found ? found.durationMin : 0;
  }, [serviceId]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const slotsRes = await getAvailableSlotsForDayAction(
        dateStr,
        durationMin
      );
      setSlots(slotsRes);
    } catch (e) {
      console.error(e);
      toast.error("Slotlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const book = async (isoStart: string) => {
    setBookingStart(isoStart);
    try {
      const res: CreateAppointmentResult = await createAppointment({
        patient: patientId,
        userId,
        reason: "Online randevu",
        schedule: new Date(isoStart),
        durationMin,
        status: "scheduled",
        note: "",
      });

      if ("error" in res) {
        if (res.error === "SLOT_TAKEN") {
          toast.error("Slot az önce doldu. Listeyi yeniliyorum.");
          await loadSlots();
          return;
        }
        toast.error("Randevu oluşturulamadı.");
        return;
      }

      toast.success("Randevu oluşturuldu.");
      await loadSlots();
    } catch (e) {
      console.error(e);
      toast.error("Randevu sırasında bir hata oluştu.");
    } finally {
      setBookingStart(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tarih & Hizmet seçimi */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={format(date, "yyyy-MM-dd")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Parçalama yerine direkt Date oluştur: TS hatası kalmaz
            setDate(new Date(`${e.target.value}T00:00:00`)); // yerel 00:00
          }}
        />

        <select
          className="border rounded px-2 py-1"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value as Service["id"])}
        >
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.durationMin} dk)
            </option>
          ))}
        </select>

        <Button onClick={loadSlots} disabled={loading || durationMin === 0}>
          {loading ? "Yükleniyor..." : "Uygun saatleri getir"}
        </Button>
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {slots.length === 0 && !loading && <p>Uygun slot yok.</p>}
        {slots.map((s) => (
          <Button
            key={s.start}
            variant="outline"
            disabled={bookingStart === s.start}
            onClick={() => book(s.start)}
            title={`Başlangıç: ${s.label}`}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
