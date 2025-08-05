"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

import { useState } from "react";
import { getAppointmentSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";

import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { CustomFormField } from "../../patient-page/custom-form-field";
import { SubmitButton } from "../../patient-page/submit-button";
import { FormFieldType } from "../../patient-page/patient-form";
import { CreateAppointmentData } from "../../../../../../types/form";
import { Appointment } from "../../../../../../types/appwrite.types";

interface AppointmentFormProps {
  userId: string;
  patientId: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen: (open: boolean) => void;
}

export const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen,
}: AppointmentFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      schedule: appointment ? new Date(appointment.schedule) : new Date(),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;

      default:
        status = "pending";
        break;
    }
    try {
      if (type === "create" && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,

          schedule: new Date(values.schedule),
          reason: values.reason!,
          note: values.note,
          status: status as Status,
        };

        const appointment = await createAppointment(appointmentData);

        if (appointment) {
          toast.success("Randevunuz başarıyla oluşturuldu.");
          form.reset();

          if ((userId = "6883b29700098b661379")) {
            router.push(`/admin/patient/${patientId}`);
          } else {
            router.push(`/dashboard/patient/${patientId}`);
          }
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id || "",
          appointment: {
            schedule: new Date(values?.schedule),
            status: status as Status,
            cancellationReason: values?.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          if (setOpen) {
            setOpen(false);
          }
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  let buttonLabel;

  switch (type) {
    case "cancel":
      buttonLabel = "Randevuyu İptal Et";
      break;
    case "create":
      buttonLabel = "Randevu Oluştur";
      break;
    case "schedule":
      buttonLabel = "Randevu Planla ";
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === "create" && (
          <section>
            <h1 className="header">Yeni Randevu</h1>
            <p className="text-white">
              10 saniyede yeni randevunuzu oluşturun...
            </p>
          </section>
        )}
        {type !== "cancel" && (
          <>
            <CustomFormField<CreateAppointmentData>
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Randevu Tarihi"
              showTimeSelect
              dateFormat="MM/dd/yyyy - hh:mm aa"
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField<CreateAppointmentData>
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Randevu konusu"
                placeholder="Randevu talebinizin nedenini yaziniz..."
              />

              <CustomFormField<CreateAppointmentData>
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Notlar"
                placeholder="Not giriniz..."
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField<CreateAppointmentData>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Randevu İptal Nedeni"
            placeholder="Randevu iptal nedeninizi yaziniz..."
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${
            type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};
