// src/app/(home)/admin/patient/[patientId]/edit/page.tsx
import { getPatientById } from "@/lib/actions/patient.actions";
import UpdatePatientForm from "@/modules/ui/components/patient-page/update-patient-form";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  // Hem sync hem async params ile uyumlu
  params: Promise<{ patientId: string }>;
}) {
  // ⬇️ sync/async fark etmeksizin güvenli
  const { patientId } = await Promise.resolve(params);

  const patient = await getPatientById(patientId);
  if (!patient) return notFound();

  const birthDateInitial =
    typeof patient.birthDate === "string"
      ? new Date(patient.birthDate)
      : undefined;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Hasta Bilgilerini Güncelle</h1>

      <UpdatePatientForm
        patientId={patientId}
        initialValues={{
          name: patient.name ?? "",
          email: patient.email ?? "",
          phone: patient.phone ?? "",
          address: patient.address ?? "",
          occupation: patient.occupation ?? "",
          emergencyContactName: patient.emergencyContactName ?? "",
          emergencyContactNumber: patient.emergencyContactNumber ?? "",
          allergies: patient.allergies ?? "",
          currentMedication: patient.currentMedication ?? "",
          familyMedicalHistory: patient.familyMedicalHistory ?? "",
          pastMedicalHistory: patient.pastMedicalHistory ?? "",
          identificationNumber: patient.identificationNumber ?? "",
          birthDate: birthDateInitial,
        }}
      />
    </div>
  );
}
