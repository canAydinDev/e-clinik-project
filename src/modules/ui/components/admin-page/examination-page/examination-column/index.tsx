"use client";

import { ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns";
import { Examination } from "../../../../../../../types/form";

export const examinationColumns: ColumnDef<Examination>[] = [
  {
    header: "Sıra",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "procedure",
    header: "İşlem",
    cell: ({ row }) => (
      <p className="text-14-medium">{row.original.procedure}</p>
    ),
  },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ row }) => (
      <p className="text-14-regular">
        {format(new Date(row.original.date), "dd.MM.yyyy")}
      </p>
    ),
  },
  {
    accessorKey: "doctorNote",
    header: "Doktor Notu",
    cell: ({ row }) => (
      <p className="text-14-regular text-gray-700">
        {row.original.doctorNote || "-"}
      </p>
    ),
  },
  {
    accessorKey: "nextControlDate",
    header: "Kontrol Tarihi",
    cell: ({ row }) => (
      <p className="text-14-regular text-gray-500">
        {row.original.nextControlDate
          ? format(new Date(row.original.nextControlDate), "dd.MM.yyyy")
          : "-"}
      </p>
    ),
  },
];
