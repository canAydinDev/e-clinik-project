"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { getAvailableSlotsForDayAction } from "@/lib/actions/getSlots.actions";

import { CustomFormField } from "../../patient-page/custom-form-field";
import { SubmitButton } from "../../patient-page/submit-button";
import { FormFieldType } from "../../patient-page/patient-form";
import { getAppointmentSchema } from "@/lib/validation";
import type { AppointmentFormData } from "../../../../../../types/form";
import type { Appointment } from "../../../../../../types/appwrite.types";

interface AppointmentFormProps {
  userId: string;
  patientId: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen: (open: boolean) => void;
}

const SERVICES = [
  { id: "botox", name: "Botoks", durationMin: 30 },
  { id: "prp", name: "PRP", durationMin: 45 },
] as const;
type Service = (typeof SERVICES)[number];
type SlotItem = { start: string; end: string; label: string };

export const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen,
}: AppointmentFormProps) => {
  const router = useRouter();

  // ---- NEW: AppointmentCreateForm ile aynı state mimarisi ----
  const [date, setDate] = React.useState<Date>(
    appointment?.schedule ? new Date(appointment.schedule) : new Date()
  );
  const [serviceId, setServiceId] = React.useState<Service["id"]>(
    SERVICES[0].id
  );
  const [slots, setSlots] = React.useState<SlotItem[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);

  const durationMin: number = React.useMemo(() => {
    const found = SERVICES.find((s) => s.id === serviceId);
    return found ? found.durationMin : 0;
  }, [serviceId]);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      // create/schedule'da gerçek tarih selectedSlot'tan gelir
      schedule: appointment ? new Date(appointment.schedule) : new Date(),
      reason: appointment?.reason ?? "",
      note: appointment?.note ?? "",
      cancellationReason: appointment?.cancellationReason ?? "",
    },
    mode: "onTouched",
  });

  // Tarih veya servis değişince slotları/seleksiyonu sıfırla
  React.useEffect(() => {
    setSelectedSlot(null);
    setSlots([]);
  }, [date, serviceId]);

  const loadSlots = async () => {
    setIsFetchingSlots(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd"); // TZ-safe
      const res = await getAvailableSlotsForDayAction(dateStr, durationMin);
      setSlots(res);
      if (res.length === 0) toast.message("Uygun slot bulunamadı.");
    } catch (e) {
      console.error(e);
      toast.error("Slotlar yüklenirken bir hata oluştu.");
    } finally {
      setIsFetchingSlots(false);
    }
  };

  // Form submit (seçilen slot zorunlu)
  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    type Status = "scheduled" | "cancelled" | "pending";
    const status: Status =
      type === "schedule"
        ? "scheduled"
        : type === "cancel"
        ? "cancelled"
        : "pending";

    try {
      // 1) İPTAL AKIŞI
      if (type === "cancel") {
        const updated = await updateAppointment({
          userId,
          appointmentId: appointment?.$id || "",
          appointment: {
            // iptalde zamanı değiştirmek istemezsen mevcut zamanı koru
            schedule: appointment?.schedule
              ? new Date(appointment.schedule)
              : new Date(values.schedule),
            status, // "cancelled"
            cancellationReason: values?.cancellationReason ?? "",
          },
        });

        if (updated) {
          toast.success("Randevu iptal edildi.");
          form.reset();
          setOpen?.(false);
          router.refresh();
        }
        return;
      }

      // 2) CREATE
      if (type === "create") {
        if (!selectedSlot) {
          toast.error("Lütfen bir saat (slot) seçin.");
          return;
        }
        const created = await createAppointment({
          userId,
          patient: patientId,
          schedule: new Date(selectedSlot),
          reason: values.reason ?? "",
          note: values.note ?? "",
          durationMin,
          status: "scheduled",
        });

        if (created) {
          toast.success("Randevunuz başarıyla oluşturuldu.");
          form.reset();
          setSelectedSlot(null);
          setSlots([]);
          setOpen?.(false);
          router.push(`/admin/patient/${patientId}`);
        }
        return;
      }

      // 3) SCHEDULE (PLANLA)
      if (type === "schedule") {
        if (!selectedSlot) {
          toast.error("Lütfen yeni bir saat (slot) seçin.");
          return;
        }

        const updated = await updateAppointment({
          userId,
          appointmentId: appointment?.$id || "",
          appointment: {
            schedule: new Date(selectedSlot), // yeni saat
            status: "scheduled",
            reason: form.getValues("reason") ?? appointment?.reason,
            note: form.getValues("note") ?? appointment?.note,
          },
        });

        if (updated) {
          toast.success("Randevu planlandı/güncellendi.");
          form.reset();
          setSelectedSlot(null);
          setSlots([]);
          setOpen?.(false);
          router.refresh();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("İşlem sırasında bir hata oluştu.");
    }
  };

  // Input için güvenli YYYY-MM-DD (TZ kayması yok)
  const inputDateValue = React.useMemo(
    () => date.toLocaleDateString("en-CA"),
    [date]
  );

  let buttonLabel: string;
  switch (type) {
    case "cancel":
      buttonLabel = "Randevuyu İptal Et";
      break;
    case "create":
      buttonLabel = "Randevu Oluştur";
      break;
    case "schedule":
      buttonLabel = "Randevu Planla";
      break;
    default:
      buttonLabel = "Kaydet";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === "create" && (
          <section>
            <h1 className="header">Yeni Randevu</h1>
            <p className="text-white">
              Tarih & hizmet seçin, uygun saatlerden birini tıklayın; konu ve
              notu doldurun.
            </p>
          </section>
        )}

        {/* create & schedule */}
        {type !== "cancel" && (
          <>
            {/* Tarih & Hizmet seçimi */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-white/80">Tarih</label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={inputDateValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.currentTarget.value;
                  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
                  const [yStr, mStr, dStr] = v.split("-") as [
                    string,
                    string,
                    string
                  ];
                  const y = Number(yStr);
                  const m = Number(mStr);
                  const d = Number(dStr);
                  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d))
                    return;
                  // Local midnight → TZ kayması yok
                  setDate(new Date(y, m - 1, d));
                }}
              />

              <label className="text-sm text-white/80 ml-2">Hizmet</label>
              <select
                className="border rounded px-2 py-1"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value as Service["id"])}
              >
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMin} dk)
                  </option>
                ))}
              </select>

              <Button
                type="button"
                onClick={loadSlots}
                disabled={isFetchingSlots || durationMin === 0}
              >
                {isFetchingSlots ? "Yükleniyor..." : "Uygun saatleri getir"}
              </Button>
            </div>

            {/* Slot grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {slots.length === 0 && !isFetchingSlots && (
                <p className="col-span-full text-sm text-white/80">
                  Uygun slot yok.
                </p>
              )}
              {slots.map((s) => (
                <Button
                  key={s.start}
                  variant={selectedSlot === s.start ? "default" : "outline"}
                  type="button"
                  title={`Başlangıç: ${s.label}`}
                  onClick={() => setSelectedSlot(s.start)}
                >
                  {s.label}
                </Button>
              ))}
            </div>

            {/* Ek alanlar */}
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField<AppointmentFormData>
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Randevu Konusu"
                placeholder="Randevu nedenini yazınız..."
              />

              <CustomFormField<AppointmentFormData>
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Notlar"
                placeholder="Not giriniz..."
              />
            </div>
          </>
        )}

        {/* cancel: sadece iptal nedeni */}
        {type === "cancel" && (
          <CustomFormField<AppointmentFormData>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Randevu İptal Nedeni"
            placeholder="Randevu iptal nedeninizi yazınız..."
          />
        )}

        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className={`${
            type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>

        {/* create/schedule guard */}
        {type !== "cancel" && !selectedSlot && (
          <p className="text-xs text-white/60 mt-2">
            Lütfen bir slot seçmeden randevu oluşturamazsınız/planlayamazsınız.
          </p>
        )}
      </form>
    </Form>
  );
};
