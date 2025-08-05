"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateExamination } from "@/lib/actions/examinations.actions";
import { CustomFormField } from "../../../patient-page/custom-form-field";
import { FormFieldType } from "../../../patient-page/patient-form";
import { SubmitButton } from "../../../patient-page/submit-button";

const ExaminationFormSchema = z.object({
  procedure: z.string().min(1, "İşlem adı zorunludur"),
  doctorNote: z.string().optional(),
  date: z.date().optional(),
  nextControlDate: z.date().optional(),
});

interface EditExaminationFormProps {
  examinationId: string;
  initialValues: {
    procedure: string;
    doctorNote?: string;
    date?: string;
    nextControlDate?: string;
  };
  onSuccess?: () => void;
}

export const EditExaminationForm = ({
  examinationId,
  initialValues,
  onSuccess,
}: EditExaminationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ExaminationFormSchema>>({
    resolver: zodResolver(ExaminationFormSchema),
    defaultValues: {
      procedure: initialValues.procedure,
      doctorNote: initialValues.doctorNote || "",
      date: initialValues.date ? new Date(initialValues.date) : new Date(),
      nextControlDate: initialValues.nextControlDate
        ? new Date(initialValues.nextControlDate)
        : undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof ExaminationFormSchema>) => {
    setIsLoading(true);
    try {
      const result = await updateExamination(examinationId, {
        procedure: values.procedure,
        doctorNote: values.doctorNote,
        date: values.date,
        nextControlDate: values.nextControlDate,
      });

      if (result?.$id) {
        toast.success("Muayene başarıyla güncellendi.");
        onSuccess?.();
        router.push(`/admin/examination/${result.$id}`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Güncelleme sırasında hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold">Muayene Güncelle</h1>
          <p className="text-sm text-gray-600">
            Muayene bilgilerini güncelleyin.
          </p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.DATE_PICKER}
          control={form.control}
          name="date"
          label="Muayene Tarihi"
          showTimeSelect
          dateFormat="MM/dd/yyyy - hh:mm aa"
        />

        <CustomFormField
          fieldType={FormFieldType.DATE_PICKER}
          control={form.control}
          name="nextControlDate"
          label="Kontrol Tarihi"
          showTimeSelect
          dateFormat="MM/dd/yyyy - hh:mm aa"
        />

        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="procedure"
          label="Uygulanan İşlem"
          placeholder="Yapılan işlemi giriniz..."
        />

        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="doctorNote"
          label="Doktor Notu"
          placeholder="Varsa not ekleyiniz..."
        />

        <SubmitButton isLoading={isLoading} className="shad-primary-btn w-full">
          Güncellemeyi Kaydet
        </SubmitButton>
      </form>
    </Form>
  );
};
