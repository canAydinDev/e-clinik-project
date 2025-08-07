"use client";

import { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "../status-badge";
import { formatDateTime } from "@/lib/utils";

import { AppointmentModal } from "../appointment-model";
import { Appointment } from "../../../../../../types/appwrite.types";

import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const formatMyDateTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  return {
    dateTime: format(date, "dd MMMM yyyy HH:mm", { locale: tr }),
    dateOnly: format(date, "dd MMMM yyyy", { locale: tr }),
    timeOnly: format(date, "HH:mm", { locale: tr }),
  };
};

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "patient",
    header: "Danışan",
    cell: ({ row }) => (
      <p className="text-14-medium">{row.original.patient.name}</p>
    ),
  },
  {
    accessorKey: "reason",
    header: "Sebep",
    cell: ({ row }) => <p className="text-14-medium">{row.original.reason}</p>,
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => (
      <div className="min-w-[115px]">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "schedule",
    header: "Tarih",
    cell: ({ row }) => (
      <p className="text-14-regular min-w-[100px]">
        {formatMyDateTime(row.original.schedule).dateTime}
      </p>
    ),
  },

  {
    id: "actions",
    header: () => <div className="pl-4">Randevu</div>,
    cell: ({ row: { original: data } }) => {
      return (
        <div className="flex gap-1">
          <AppointmentModal
            patientId={data.patient.$id}
            type="schedule"
            userId={data.userId}
            appointment={data}
          />
          <AppointmentModal
            patientId={data.patient.$id}
            type="cancel"
            userId={data.userId}
            appointment={data}
          />
        </div>
      );
    },
  },
];
