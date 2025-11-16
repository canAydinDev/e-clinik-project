"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Patient } from "../../../../../../types/form";

export const patientColumns: ColumnDef<Patient>[] = [
  {
    header: "Sıra",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "face",
    header: "Fotoğraf",
    cell: ({ row }) => {
      const imageUrl = row.original.faceUrl;
      return imageUrl ? (
        <div className="flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Hasta Fotoğrafı"
            width={64}
            height={64}
            className="h-16 w-16 rounded-2xl border border-gray-200 object-cover shadow-sm"
          />
        </div>
      ) : (
        <span className="text-gray-400">Yok</span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Adı Soyadı",
    cell: ({ row }) => <p className="text-14-medium">{row.original.name}</p>,
  },

  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => <p className="text-14-regular">{row.original.phone}</p>,
  },
  {
    accessorKey: "email",
    header: "E-posta",
    cell: ({ row }) => <p className="text-14-regular">{row.original.email}</p>,
  },
];
