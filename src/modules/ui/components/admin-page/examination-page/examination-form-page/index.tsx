"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExamination } from "@/lib/actions/examinations.actions";
import { CustomFormField } from "../../../patient-page/custom-form-field";
import { FormFieldType } from "../../../patient-page/patient-form";
import { SubmitButton } from "../../../patient-page/submit-button";

const ExaminationFormSchema = z.object({
  procedure: z.string().min(1, "İşlem adı zorunludur"),
  doctorNote: z.string().optional(),
  date: z.date().optional(),
  nextControlDate: z.date().optional(),
});

interface ExaminationFormProps {
  patientId: string;
  setOpen: (open: boolean) => void;
}

export const ExaminationForm = ({
  patientId,
  setOpen,
}: ExaminationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ExaminationFormSchema>>({
    resolver: zodResolver(ExaminationFormSchema),
    defaultValues: {
      procedure: "",
      doctorNote: "",
      date: new Date(),
      nextControlDate: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof ExaminationFormSchema>) => {
    setIsLoading(true);
    try {
      const examinationData = {
        patientId,
        procedure: values.procedure,
        doctorNote: values.doctorNote,
        date: values.date,
        nextControlDate: values.nextControlDate,
      };

      const result = await createExamination(examinationData);

      if (result) {
        toast.success("Muayene başarıyla oluşturuldu.");
        form.reset();
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold">Yeni Muayene</h1>
          <p className="text-sm text-gray-600">Muayene bilgilerini giriniz.</p>
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
          Muayene Kaydet
        </SubmitButton>
      </form>
    </Form>
  );
};
