"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "schedule", desc: true }],
    },
  });
  // DataTable bileşeni içinde, useReactTable çağrısının üstüne ya da altına:
  const [cancelReason, setCancelReason] = React.useState<string | null>(null);

  return (
    <>
      <div className="z-10 w-full overflow-hidden rounded-lg border border-gray-800  shadow-lg">
        <Table className="rounded-lg overflow-hidden">
          <TableHeader className="bg-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-gray-800  text-gray-900 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border border-gray-400  px-4 py-2"
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const r = row.original as any; // {status, cancellationReason} bekleniyor
                const isCancelled = r?.status === "cancelled";
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-b border-gray-800 text-gray-700 ${
                      isCancelled ? "cursor-pointer hover:bg-red-50/70" : ""
                    }`}
                    onClick={() => {
                      if (isCancelled) {
                        setCancelReason(
                          r?.cancellationReason?.trim() ||
                            "İptal nedeni belirtilmemiş."
                        );
                      }
                    }}
                    title={
                      isCancelled
                        ? "İptal edilen randevu – nedeni görmek için tıklayın"
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border border-gray-400 px-4 py-2"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center border border-gray-300"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex w-full items-center justify-between space-x-2 p-4 ">
          <Button
            variant="outline"
            size="lg"
            className="border border-gray-300  cursor-pointer bg-gray-800  text-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <Image
              src="/assets/icons/arrow.svg"
              alt="back"
              width={24}
              height={24}
            />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border border-gray-300  cursor-pointer bg-gray-800  text-white"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <Image
              src="/assets/icons/arrow.svg"
              alt="back"
              width={24}
              height={24}
              className="rotate-180"
            />
          </Button>
        </div>
      </div>
      <AlertDialog
        open={!!cancelReason}
        onOpenChange={(open) => !open && setCancelReason(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İptal Nedeni</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="whitespace-pre-wrap text-left">
                {cancelReason}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setCancelReason(null)}>
              Tamam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
