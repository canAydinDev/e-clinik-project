"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  getPaginationRowModel, // DÜZELTME: Eksik import eklendi
  getSortedRowModel, // DÜZELTME: Eksik import eklendi
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";
import { deleteAppointment } from "@/lib/actions/appointment.actions";

// DÜZELTME: Tür-güvenliği için generic kısıtlama
interface RowDataWithStatus {
  $id: string;
  status?: string;
  cancellationReason?: string | null;
}

interface DataTableProps<TData extends RowDataWithStatus, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable2<TData extends RowDataWithStatus, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // DÜZELTME: Eksik ayar eklendi
    getSortedRowModel: getSortedRowModel(), // DÜZELTME: Eksik ayar eklendi
  });

  const [reasonDialogData, setReasonDialogData] = React.useState<{
    id: string;
    reason: string;
  } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // KALDIRILDI: Bu state gereksiz olduğu için kaldırıldı.
  // const [cancelReason, setCancelReason] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!reasonDialogData) return;
    setIsDeleting(true);
    try {
      await deleteAppointment(reasonDialogData.id);
      console.log("Randevu başarıyla silindi.");
    } catch (error) {
      console.error("Randevu silinirken hata oluştu:", error);
    } finally {
      setIsDeleting(false);
      setReasonDialogData(null);
      setShowDeleteConfirm(false);
    }
  };

  const openConfirmationDialog = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <div className="z-10 w-full overflow-hidden rounded-lg border border-gray-800 shadow-lg">
        <Table className="rounded-lg overflow-hidden">
          <TableHeader className="bg-gray-200">{/* ... */}</TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                // DÜZELTME: `as any` kaldırıldı, tür-güvenli hale getirildi.
                const rowData = row.original;
                const isCancelled = rowData.status === "cancelled";

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-b border-gray-800 text-gray-700 ${
                      isCancelled ? "cursor-pointer hover:bg-red-50/70" : ""
                    }`}
                    onClick={() => {
                      if (isCancelled) {
                        // DÜZELTME: Diyaloğu açmak için DOĞRU state güncellendi.
                        setReasonDialogData({
                          id: rowData.$id,
                          reason:
                            rowData.cancellationReason?.trim() ||
                            "İptal nedeni belirtilmemiş.",
                        });
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
          {/* ... Paginasyon butonları ... */}
        </div>
      </div>

      {/* 1. Diyalog: İptal Nedenini Gösterme */}
      <AlertDialog
        open={!!reasonDialogData}
        onOpenChange={(open) => !open && setReasonDialogData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İptal Nedeni</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="whitespace-pre-wrap text-left">
                {reasonDialogData?.reason}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setReasonDialogData(null)}>
              Kapat
            </Button>
            <Button variant="destructive" onClick={openConfirmationDialog}>
              Kalıcı Olarak Sil
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. Diyalog: Silme Onayı */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu randevu sistemden kalıcı olarak silinecektir. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
