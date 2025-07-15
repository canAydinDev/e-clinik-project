import { GenderOptions } from "@/constants";
import { z } from "zod";

export const UserFormValidation = z
  .object({
    name: z
      .string()
      .min(3, "İsim en az 3 karakter olmalıdır")
      .max(50, "İsim en fazla 50 karakter olabilir"),
    email: z.string().optional(),

    phone: z
      .string()
      .refine(
        (phone) => /^\+\d{10,15}$/.test(phone),
        "Geçersiz telefon numarası"
      ),
    password: z
      .string()
      .regex(/^\d{6}$/, "Şifre 6 haneli ve sadece rakamlardan oluşmalıdır"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const PatientFormValidation2 = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(50, "İsim en fazla 50 karakter olabilir"),
  email: z.string().email("Geçersiz e-posta adresi"),
  phone: z
    .string()
    .refine(
      (phone) => /^\+\d{10,15}$/.test(phone),
      "Geçersiz telefon numarası"
    ),
  birthDate: z.coerce.date(),
  gender: z.enum(GenderOptions),
  address: z
    .string()
    .min(5, "Adres en az 5 karakter olmalıdır")
    .max(500, "Adres en fazla 500 karakter olabilir"),
  occupation: z
    .string()
    .min(2, "Meslek en az 2 karakter olmalıdır")
    .max(500, "Meslek en fazla 500 karakter olabilir"),
  emergencyContactName: z
    .string()
    .min(2, "Yakın kişi adı en az 2 karakter olmalıdır")
    .max(50, "Yakın kişi adı en fazla 50 karakter olabilir"),
  emergencyContactNumber: z
    .string()
    .refine(
      (emergencyContactNumber) => /^\+\d{10,15}$/.test(emergencyContactNumber),
      "Geçersiz telefon numarası"
    ),
  primaryPhysician: z.string().min(2, "Lütfen bir doktor seçin"),
  insuranceProvider: z
    .string()
    .min(2, "Sigorta sağlayıcısı en az 2 karakter olmalıdır")
    .max(50, "Sigorta sağlayıcısı en fazla 50 karakter olabilir"),
  insurancePolicyNumber: z
    .string()
    .min(2, "Poliçe numarası en az 2 karakter olmalıdır")
    .max(50, "Poliçe numarası en fazla 50 karakter olabilir"),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  identificationType: z.string().optional(),
  identificationNumber: z
    .string()
    .length(11, { message: "Kimlik numarası tam olarak 11 haneli olmalıdır." }),
  identificationDocument: z.custom<File[]>().optional(),
  treatmentConsent: z
    .boolean()

    .refine((value) => value === true, {
      message: "Devam edebilmek için tedavi onayı vermelisiniz",
    }),
  disclosureConsent: z
    .boolean()

    .refine((value) => value === true, {
      message: "Devam edebilmek için bilgi paylaşımı onayı vermelisiniz",
    }),
  privacyConsent: z
    .boolean()

    .refine((value) => value === true, {
      message: "Devam edebilmek için gizlilik politikasını kabul etmelisiniz",
    }),
});

export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Lütfen bir doktor seçin"),
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Sebep en az 2 karakter olmalıdır")
    .max(500, "Sebep en fazla 500 karakter olabilir"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Lütfen bir doktor seçin"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Lütfen bir doktor seçin"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "İptal sebebi en az 2 karakter olmalıdır")
    .max(500, "İptal sebebi en fazla 500 karakter olabilir"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}
