import { getPatientById } from "@/lib/actions/patient.actions";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeletePatientButton } from "../delete-patient-button";

interface PatientDetailProps {
  patientId: string;
}

/** Doğum tarihinden tam yıl yaşı hesaplar */
function calcAgeFromISO(dobISO: string): number | null {
  const dob = new Date(dobISO);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : null;
}

/** TR formatında (Europe/Istanbul) kısa tarih */
function fmtDateTR(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(d);
}

/** Şemana uygun minimal tip (getPatientById dönüşü bu alanları içermeli) */
type PatientSchema = {
  $id?: string;
  userId: string; // required
  name: string; // required
  phone: string; // required
  email?: string;
  birthDate?: string;
  address?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationNumber?: string;
};

export const PatientDetailPage = async ({ patientId }: PatientDetailProps) => {
  const patient = (await getPatientById(patientId)) as PatientSchema | null;

  if (!patient) {
    return <div>Hasta bulunamadi!...</div>;
  }

  const dobText = patient.birthDate ? fmtDateTR(patient.birthDate) : "—";
  const age = patient.birthDate ? calcAgeFromISO(patient.birthDate) : null;

  return (
    <div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Ad Soyad</TableCell>
              <TableCell>{patient.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Doğum Tarihi</TableCell>
              <TableCell>{dobText}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Yaş</TableCell>
              <TableCell>{typeof age === "number" ? age : "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Telefon</TableCell>
              <TableCell>{patient.phone}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">E-posta</TableCell>
              <TableCell>{patient.email ?? "—"}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Meslek</TableCell>
              <TableCell>{patient.occupation ?? "—"}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Acil Durum Yakını</TableCell>
              <TableCell>{patient.emergencyContactName ?? "—"}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Acil Durum Telefonu</TableCell>
              <TableCell>{patient.emergencyContactNumber ?? "—"}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">T.C. Kimlik No</TableCell>
              <TableCell>{patient.identificationNumber ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Adres</TableCell>
              <TableCell className="whitespace-pre-wrap">
                {patient.address ?? "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Alerjiler</TableCell>
              <TableCell className="whitespace-pre-wrap">
                {patient.allergies ?? "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Kullandığı İlaçlar</TableCell>
              <TableCell className="whitespace-pre-wrap">
                {patient.currentMedication ?? "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Aile Tıbbi Geçmişi</TableCell>
              <TableCell className="whitespace-pre-wrap">
                {patient.familyMedicalHistory ?? "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Geçmiş Tıbbi Öykü</TableCell>
              <TableCell className="whitespace-pre-wrap">
                {patient.pastMedicalHistory ?? "—"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full mt-2 p-2">
        <Button asChild className="w-full" variant="greenElevated">
          <Link href={`/admin/patient/${encodeURIComponent(patientId)}/edit`}>
            Bilgileri Güncelle
          </Link>
        </Button>
      </div>
      <div className="flex w-full p-2">
        <DeletePatientButton
          patientId={patient.$id ?? patientId}
          redirectTo="/admin" // dilediğiniz route
        />
      </div>
    </div>
  );
};
