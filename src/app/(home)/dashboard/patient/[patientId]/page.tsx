import { getPatientById } from "@/lib/actions/patient.actions";
import Image from "next/image";

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
      <h2>{patient.name}</h2>
      <p>{patient?.faceUrl || "hello"}</p>

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
  );
};

export default Patient;
