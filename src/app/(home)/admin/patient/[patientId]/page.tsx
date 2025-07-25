import { getPatientById } from "@/lib/actions/patient.actions";
import Image from "next/image";
import Link from "next/link";

interface PatientProps {
  params: Promise<{ patientId: string }>;
}

const Patient = async ({ params }: PatientProps) => {
  const { patientId } = await params;
  const patient = await getPatientById(patientId);

  if (!patient) {
    return <div>Hasta bulunamadı.</div>;
  }

  return (
    <div>
      <div>
        <div>
          <h2>{patient.name}</h2>

          {patient.faceUrl ? (
            <Image
              src={patient.faceUrl}
              alt="Hasta Fotoğrafı"
              width={200}
              height={200}
              objectFit="cover"
            />
          ) : (
            <p>Fotoğraf yok</p>
          )}
        </div>
      </div>
      <div>
        <h2>Yeni Randevu</h2>
        <Link href={`/admin/appointments/${patientId}`}>Randevu Al</Link>
      </div>
    </div>
  );
};

export default Patient;
