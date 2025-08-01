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
        <Image
          src={imageUrl}
          alt={"pic"}
          width={80}
          height={80}
          className="rounded-2xl object-cover"
        />
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
