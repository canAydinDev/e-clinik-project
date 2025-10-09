"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "../../patient-page/custom-form-field";
import { SubmitButton } from "../../patient-page/submit-button";
import { FormFieldType } from "../../patient-page/patient-form";
import { getAppointmentSchema } from "@/lib/validation";

import { createAppointment } from "@/lib/actions/appointment.actions";
import { getAvailableSlotsForDayAction } from "@/lib/actions/getSlots.actions";

import type { AppointmentFormData } from "../../../../../../types/form";
import { toast } from "sonner";

const SERVICES = [
  { id: "botox", name: "Botoks", durationMin: 30 },
  { id: "prp", name: "PRP", durationMin: 45 },
] as const;

type Service = (typeof SERVICES)[number];
type SlotItem = { start: string; end: string; label: string };

export function DashboardAppointmentCreateForm({
  patientId,
  userId,
  setOpen,
}: {
  patientId: string;
  userId: string;
  setOpen?: (open: boolean) => void;
}) {
  const router = useRouter();

  // Tarihi Date state olarak tutuyoruz ama input gösteriminde en-CA formatı kullanıyoruz (YYYY-MM-DD).
  // onChange'de local new Date(y, m-1, d) ile set ediyoruz -> TZ kayması yok.
  const [date, setDate] = React.useState<Date>(new Date());
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

  // Zod şema
  const AppointmentFormValidation = getAppointmentSchema("create");

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      schedule: new Date(), // Not: fiilen selectedSlot kullanılacak, burası form şeması için
      reason: "",
      note: "",
    },
    mode: "onTouched",
  });

  // Tarih veya servis değiştiğinde seçili slotları temizle:
  React.useEffect(() => {
    setSelectedSlot(null);
    setSlots([]);
  }, [date, serviceId]);

  // Slotları getir (UTC yerine local tarih formatını gönderiyoruz)
  const loadSlots = async () => {
    setIsFetchingSlots(true);
    try {
      // ISO yerine yerel format: yyyy-MM-dd
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await getAvailableSlotsForDayAction(dateStr, durationMin);
      setSlots(res);
      if (res.length === 0) {
        toast.message("Uygun slot bulunamadı.");
      }
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
    if (!selectedSlot) {
      toast.error("Lütfen bir saat (slot) seçin.");
      return;
    }
    try {
      // selectedSlot ISO string (start) ise burada new Date ile veriyoruz.
      const appointment = await createAppointment({
        userId,
        patient: patientId,
        schedule: new Date(selectedSlot),
        reason: values.reason ?? "",
        note: values.note ?? "",
        durationMin,
        status: "scheduled",
      });

      if (appointment) {
        toast.success("Randevunuz başarıyla oluşturuldu.");
        form.reset();
        setSelectedSlot(null);
        setSlots([]);
        if (setOpen) setOpen(false);
        router.push(`/dashboard/patient/${patientId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Randevu oluşturulamadı.");
    }
  };

  // Yardımcı: input value'su için güvenli YYYY-MM-DD üretimi (TZ-safe)
  const inputDateValue = React.useMemo(() => {
    // toLocaleDateString("en-CA") -> YYYY-MM-DD
    return date.toLocaleDateString("en-CA");
  }, [date]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section>
          <h1 className="header">Yeni Randevu</h1>

          <p className="text-white">
            Tarih ve hizmet seç, uygun saatlerden birini tıkla; sebep ve notu
            doldur.
          </p>
        </section>

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
              if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return;
              // Local midnight: TZ kayması yok
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

        {/* Submit */}
        <SubmitButton
          className="shad-primary-btn w-full"
          // SubmitButton içinde kendi loading kontrolün varsa formState.isSubmitting’i kullan
          isLoading={form.formState.isSubmitting}
        >
          Randevu Oluştur
        </SubmitButton>

        {/* Küçük bir uyarı */}
        {!selectedSlot && (
          <p className="text-xs text-white/60">
            Lütfen bir slot seçmeden randevu oluşturamazsınız.
          </p>
        )}
      </form>
    </Form>
  );
}
