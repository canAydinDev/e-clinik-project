"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";

import { CustomFormField } from "../custom-form-field";
import { SubmitButton } from "../submit-button";
import { useState } from "react";
import { PatientFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { registerPatient } from "@/lib/actions/patient.actions";
import { FormFieldType } from "../patient-form";
import { PatientFormDefaultValues } from "@/constants";
import { FileUploader } from "../file-uploader";

interface RegisterFormProps {
  user: User;
}

export const RegisterForm = ({ user }: RegisterFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoading(true);

    let formData: FormData | undefined;

    const faceFile = values.face?.[0]; // 👈 Daha güvenli
    if (faceFile) {
      const blobFile = new Blob([faceFile], {
        type: faceFile.type,
      });

      formData = new FormData();
      formData.append("blobFile", blobFile);
      formData.append("fileName", faceFile.name);
    }

    try {
      const patientData = {
        ...values,
        userId: user.$id,
        birthDate: new Date(values.birthDate),
        face: formData,
      };

      // @ts-ignore
      const patient = await registerPatient(patientData);
      if (patient) router.push(`/patient/${patient.$id}`);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 flex-1"
      >
        <section className="space-y-4">
          <h1 className="header">Hoşgeldiniz 👋 </h1>
        </section>
        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Yeni Hasta Kaydı</h2>
          </div>
        </section>
        <CustomFormField<z.infer<typeof PatientFormValidation>>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Adı Soyadı"
          placeholder="Adı Soyadı"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <div className="flex flex-col xl:flex-row gap-6">
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="adiniz@email.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Tel"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="address"
            label="Adres"
            placeholder="5432 sok. Seyhan / Adana"
          />

          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="occupation"
            label="Meslek"
            placeholder="Mesleğiniz"
          />
        </div>
        <div className="flex flex-col xl:flex-row gap-6">
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="emergencyContactName"
            label="Acil Durumda Aranacak Kişi"
            placeholder="Kişinin ismi"
          />
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="emergencyContactNumber"
            label="Acil Durum İletişim No"
            placeholder="(555) 123-4567"
          />
        </div>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Tıbbi Geçmişiniz</h2>
          </div>
        </section>
        <div className="flex flex-col xl:flex-row gap-6">
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
            name="birthDate"
            label="Doğum Tarihi"
          />
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="allergies"
            label="Allerji Durumu"
            placeholder="Yer Fıstığı"
          />

          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="currentMedication"
            label="Kullanılan İlaçlar"
            placeholder="Paracetamol 500mg"
          />
        </div>
        <div className="flex flex-col xl:flex-row gap-6">
          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="familyMedicalHistory"
            label="Aile Öyküsü"
            placeholder="DM, HT"
          />

          <CustomFormField<z.infer<typeof PatientFormValidation>>
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="pastMedicalHistory"
            label="Tıbbi Geçmişi"
            placeholder="Apendektomi"
          />
        </div>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Kimlik Tespiti ve Doğrulama</h2>
          </div>
        </section>

        <CustomFormField<z.infer<typeof PatientFormValidation>>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="identificationNumber"
          label="Kimlik No"
          placeholder="12345678911"
        />

        <CustomFormField<z.infer<typeof PatientFormValidation>>
          fieldType={FormFieldType.SKELETON}
          control={form.control}
          name="face"
          label="Foto Yukleyiniz"
          renderSkeleton={(field) => (
            <FormControl>
              <FileUploader files={field.value} onChange={field.onChange} />
            </FormControl>
          )}
        />

        <SubmitButton isLoading={isLoading}>Şimdi Kaydolun...</SubmitButton>
      </form>
    </Form>
  );
};
