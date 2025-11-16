"use client";

import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  getDayScheduleAction,
  type DayScheduleSlot,
} from "@/lib/actions/getSlots.actions";

interface DayScheduleGridProps {
  date: Date;
  refreshKey?: number;
}

const slotColors: Record<DayScheduleSlot["status"], string> = {
  free: "bg-emerald-500/90 text-white",
  booked: "bg-red-500/80 text-white",
};

export const DayScheduleGrid: React.FC<DayScheduleGridProps> = ({
  date,
  refreshKey = 0,
}) => {
  const [slots, setSlots] = React.useState<DayScheduleSlot[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openingLabel, setOpeningLabel] = React.useState<string | null>(null);
  const [closingLabel, setClosingLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const schedule = await getDayScheduleAction(format(date, "yyyy-MM-dd"));
        if (!active) return;
        setSlots(schedule.slots);
        setOpeningLabel(schedule.openingLabel);
        setClosingLabel(schedule.closingLabel);
      } catch (e) {
        console.error(e);
        if (active) setError("Takvim bilgileri alınamadı.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [date, refreshKey]);

  const dateLabel = React.useMemo(
    () =>
      format(date, "d MMM yyyy, EEEE", {
        locale: tr,
      }),
    [date]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/40 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Günlük Takvim Görünümü
          </p>
          <p className="text-xs text-gray-500">{dateLabel}</p>
          {openingLabel && closingLabel && (
            <p className="text-xs text-gray-500">
              Çalışma saatleri: {openingLabel} – {closingLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-emerald-500" />
            Müsait
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-red-500" />
            Dolu
          </span>
        </div>
      </div>

      <div className="mt-4">
        {loading && (
          <p className="text-sm text-gray-500">Takvim yükleniyor...</p>
        )}
        {error && !loading && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {!loading && !error && slots.length === 0 && (
          <p className="text-sm text-gray-500">
            Bu gün için çalışma saati veya slot tanımlanmamış.
          </p>
        )}
        {!loading && !error && slots.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {slots.map((slot) => (
              <div
                key={slot.start}
                className={`rounded-lg p-2 text-xs font-medium shadow-sm transition hover:opacity-90 ${slotColors[slot.status]}`}
                title={
                  slot.status === "booked"
                    ? `${slot.patientName ?? "Rezerve"} • ${
                        slot.reason ?? "Randevu"
                      }`
                    : "Müsait"
                }
              >
                <p className="text-[11px] font-bold">{slot.label}</p>
                {slot.status === "booked" ? (
                  <>
                    <p className="truncate text-[11px]">
                      {slot.patientName ?? "Rezerve"}
                    </p>
                    {slot.reason && (
                      <p className="truncate text-[10px] opacity-80">
                        {slot.reason}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] opacity-80">Müsait</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
