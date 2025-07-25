import { z } from "zod";
import {
  UserFormValidation,
  PatientFormValidation,
  CreateAppointmentSchema,
  ScheduleAppointmentSchema,
  CancelAppointmentSchema,
} from "@/lib/validation"; // ← gerçek import yoluna göre ayarla

export type UserFormData = z.infer<typeof UserFormValidation>;

export type PatientFormData = z.infer<typeof PatientFormValidation>;

export type CreateAppointmentData = z.infer<typeof CreateAppointmentSchema>;

export type ScheduleAppointmentData = z.infer<typeof ScheduleAppointmentSchema>;

export type CancelAppointmentData = z.infer<typeof CancelAppointmentSchema>;

export type Patient = {
  $id: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationNumber?: string;
  face?: string[]; // veya File[] ya da URL[]
  faceUrl: string;
};

export type CreateUserParams = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type User = CreateUserParams & {
  $id: string;
};
