"use client";

import { useRouter } from "next/navigation";
import { deleteExamination } from "@/lib/actions/examinations.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteExaminationButtonProps {
  examinationId: string;
  redirectTo: string; // Silme sonrası hangi sayfaya gideceğini belirt
}

export const DeleteExaminationButton = ({
  examinationId,
  redirectTo,
}: DeleteExaminationButtonProps) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      "Bu muayeneyi silmek istediğinizden emin misiniz?"
    );
    if (!confirmed) return;

    const success = await deleteExamination(examinationId);
    if (success) {
      toast.success("Muayene silindi.");
      router.push(redirectTo);
      router.refresh();
    } else {
      toast.error("Muayene silinirken hata oluştu.");
    }
  };

  return (
    <Button variant="destructiveElevated" onClick={handleDelete}>
      Muayeneyi Sil
    </Button>
  );
};
