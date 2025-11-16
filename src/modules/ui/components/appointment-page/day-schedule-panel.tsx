"use client";

import * as React from "react";
import { addDays, startOfDay, format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { DayScheduleGrid } from "./day-schedule-grid";

interface DaySchedulePanelProps {
  initialDate?: Date;
  className?: string;
  title?: string;
}

export const DaySchedulePanel: React.FC<DaySchedulePanelProps> = ({
  initialDate,
  className = "",
  title = "Günlük Randevu Takvimi",
}) => {
  const [date, setDate] = React.useState<Date>(
    () => initialDate ?? startOfDay(new Date())
  );
  const [refreshKey, setRefreshKey] = React.useState(0);

  const changeDay = (delta: number) =>
    setDate((current) => addDays(startOfDay(current), delta));
  const goToday = () => setDate(startOfDay(new Date()));
  const refresh = () => setRefreshKey((key) => key + 1);

  const dateLabel = React.useMemo(
    () =>
      format(date, "d MMMM yyyy • EEEE", {
        locale: tr,
      }),
    [date]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-base font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{dateLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDay(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => changeDay(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" onClick={goToday} className="gap-2">
            <CalendarDays className="size-4" />
            Bugün
          </Button>
          <input
            type="date"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={format(date, "yyyy-MM-dd")}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const value = event.currentTarget.value;
              if (!value) return;
              const next = new Date(`${value}T00:00:00`);
              if (!Number.isNaN(next.getTime())) {
                setDate(startOfDay(next));
              }
            }}
          />
          <Button variant="ghost" size="sm" onClick={refresh}>
            Yenile
          </Button>
        </div>
      </div>

      <DayScheduleGrid date={date} refreshKey={refreshKey} />
    </div>
  );
};
