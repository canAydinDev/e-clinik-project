"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Patient } from "../../../../../../types/form";
import { useRouter } from "next/navigation";

interface PatientDataTableProps {
  columns: ColumnDef<Patient, unknown>[];
  data: Patient[];
}

export function AdminPatientDataTable({
  columns,
  data,
}: PatientDataTableProps) {
  const router = useRouter();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="z-10 w-full rounded-lg border border-gray-300 shadow-sm">
      {/* ⬇️ Yatay kaydırma için overflow-x-auto SARMALAYICI */}
      <div className="w-full overflow-x-auto">
        {/* ⬇️ min-w ver: küçük ekranda scroll çıksın; table-fixed kaldırıldı */}
        <Table className="rounded-lg overflow-hidden min-w-[900px]">
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/patient/${row.original.$id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border px-4 py-2 text-sm text-gray-800 whitespace-nowrap"
                    >
                      {/* İstersen bazı kolonları kısaltmak için truncate kullan: */}
                      <div className="max-w-[240px] truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full items-center justify-between px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <Image
            src="/assets/icons/arrow.svg"
            alt="Geri"
            width={20}
            height={20}
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <Image
            src="/assets/icons/arrow.svg"
            alt="İleri"
            width={20}
            height={20}
            className="rotate-180"
          />
        </Button>
      </div>
    </div>
  );
}
