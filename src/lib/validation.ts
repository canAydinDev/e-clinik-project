import { z } from "zod";

export const UserFormValidation = z
  .object({
    name: z
      .string()
      .min(3, "İsim en az 3 karakter olmalıdır")
      .max(50, "İsim en fazla 50 karakter olabilir"),
    email: z.string(),

    phone: z
      .string()
      .refine(
        (phone) => /^\+\d{10,15}$/.test(phone),
        "Geçersiz telefon numarası"
      ),
    password: z
      .string()
      .regex(/^\d{8}$/, "Şifre 8 haneli ve sadece rakamlardan oluşmalıdır"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const PatientFormValidation = z.object({
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

  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  identificationNumber: z.string().optional(),
  face: z.custom<File[]>().optional(),
});

export const CreateAppointmentSchema = z.object({
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Sebep en az 2 karakter olmalıdır")
    .max(500, "Sebep en fazla 500 karakter olabilir"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
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
