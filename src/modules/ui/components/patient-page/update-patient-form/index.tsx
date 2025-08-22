"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "@/modules/ui/components/patient-page/custom-form-field";
import { SubmitButton } from "@/modules/ui/components/patient-page/submit-button";
import { updatePatient } from "@/lib/actions/patient.actions";
import { FormFieldType } from "@/modules/ui/components/patient-page/patient-form";

/** TR kısa tarih placeholder'ı */
function fmtDateTR(d?: Date) {
  return d
    ? new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeZone: "Europe/Istanbul",
      }).format(d)
    : undefined;
}

/** Update şeması: tüm alanlar opsiyonel, placeholder için boş string kabul ediyoruz */
const UpdatePatientValidation = z.object({
  name: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Geçerli e-posta giriniz")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactNumber: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  currentMedication: z.string().optional().or(z.literal("")),
  familyMedicalHistory: z.string().optional().or(z.literal("")),
  pastMedicalHistory: z.string().optional().or(z.literal("")),
  identificationNumber: z.string().optional().or(z.literal("")),
  birthDate: z.date().optional(),
});

type UpdatePatientValues = z.infer<typeof UpdatePatientValidation>;

type UpdatePatientFormProps = {
  patientId: string;
  initialValues: Partial<UpdatePatientValues>; // birthDate: Date | undefined beklenir
};

export default function UpdatePatientForm({
  patientId,
  initialValues,
}: UpdatePatientFormProps) {
  const router = useRouter();

  const form = useForm<UpdatePatientValues>({
    resolver: zodResolver(UpdatePatientValidation),
    /** Varsayılanları boş/undefined bırakıyoruz ki placeholder'lar görünsün */
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      occupation: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      allergies: "",
      currentMedication: "",
      familyMedicalHistory: "",
      pastMedicalHistory: "",
      identificationNumber: "",
      birthDate: undefined,
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: UpdatePatientValues) => {
    // sadece dolu gelen alanları payload'a ekle
    const payload: Record<string, unknown> = {};
    const add = (k: keyof UpdatePatientValues, v: unknown) => {
      if (v === undefined) return;
      if (typeof v === "string" && v.trim() === "") return; // boş stringleri gönderme
      payload[k] = v;
    };

    add("name", values.name);
    add("email", values.email);
    add("phone", values.phone);
    add("address", values.address);
    add("occupation", values.occupation);
    add("emergencyContactName", values.emergencyContactName);
    add("emergencyContactNumber", values.emergencyContactNumber);
    add("allergies", values.allergies);
    add("currentMedication", values.currentMedication);
    add("familyMedicalHistory", values.familyMedicalHistory);
    add("pastMedicalHistory", values.pastMedicalHistory);
    add("identificationNumber", values.identificationNumber);

    // Appwrite'a Date yerine ISO string gönder
    if (values.birthDate) {
      payload["birthDate"] = values.birthDate.toISOString();
    }

    const updated = await updatePatient(patientId, payload as never);
    if (updated) {
      router.push(`/admin/patient/${encodeURIComponent(patientId)}`);
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Ad Soyad"
            placeholder={initialValues.name || "Ad Soyad"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Telefon"
            placeholder={initialValues.phone || "(555) 123-4567"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="E-posta"
            placeholder={initialValues.email || "ornek@eposta.com"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
            name="birthDate"
            label="Doğum Tarihi"
            placeholder={fmtDateTR(initialValues.birthDate) || "gg.aa.yyyy"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="identificationNumber"
            label="Kimlik No"
            placeholder={initialValues.identificationNumber || "12345678911"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="occupation"
            label="Meslek"
            placeholder={initialValues.occupation || "Mesleğiniz"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="address"
            label="Adres"
            placeholder={initialValues.address || "Sokak, Mahalle, İl/İlçe"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="emergencyContactName"
            label="Acil Durum Kişisi"
            placeholder={initialValues.emergencyContactName || "İsim"}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="emergencyContactNumber"
            label="Acil Durum Tel"
            placeholder={
              initialValues.emergencyContactNumber || "(555) 123-4567"
            }
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="allergies"
            label="Alerjiler"
            placeholder={initialValues.allergies || "Yer fıstığı..."}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="currentMedication"
            label="Kullanılan İlaçlar"
            placeholder={
              initialValues.currentMedication || "Paracetamol 500mg..."
            }
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="familyMedicalHistory"
            label="Aile Tıbbi Geçmişi"
            placeholder={initialValues.familyMedicalHistory || "DM, HT..."}
          />
          <CustomFormField<UpdatePatientValues>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="pastMedicalHistory"
            label="Geçmiş Tıbbi Öykü"
            placeholder={initialValues.pastMedicalHistory || "Apendektomi..."}
          />
        </div>

        <div className="flex">
          <SubmitButton isLoading={form.formState.isSubmitting}>
            Kaydet
          </SubmitButton>
        </div>
        <div className="flex w-full">
          <Button
            className="w-full bg-red-300"
            type="button"
            variant="destructiveElevated"
            onClick={() => router.back()}
          >
            Vazgeç
          </Button>
        </div>
      </form>
    </Form>
  );
}
