"use client";

import { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "../status-badge";
import { formatDateTime } from "@/lib/utils";

import { AppointmentModal } from "../appointment-model";
import { Appointment } from "../../../../../../types/appwrite.types";

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
        {row.original.schedule.getDate()}
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
