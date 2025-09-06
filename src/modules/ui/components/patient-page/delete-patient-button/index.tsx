"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { deletePatient } from "@/lib/actions/patient.actions";

type DeletePatientButtonProps = {
  patientId: string;
  /** Silme sonrası yönlendirme adresi */
  redirectTo?: string;
};

export function DeletePatientButton({
  patientId,
  redirectTo = "/admin",
}: DeletePatientButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    setLoading(true);
    const ok = await deletePatient(patientId);
    setLoading(false);
    setOpen(false);

    if (ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      // burada isterseniz toast gösterebilirsiniz
      // toast.error("Hasta silinemedi");
    }
  };

  return (
    <>
      <Button
        className="w-full"
        type="button"
        variant="destructiveElevated"
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        Hastayı Sil
      </Button>

      <AlertDialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hasta kaydını silmek istediğinizden emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Hasta kaydı kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={loading}>
              {loading ? "Siliniyor..." : "Hastayı sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
