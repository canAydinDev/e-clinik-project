import { Button } from "@/components/ui/button";
import { getPatientById } from "@/lib/actions/patient.actions";
import Image from "next/image";
import Link from "next/link";

interface PatientProps {
  params: { patientId: string };
}

const Patient = async ({ params }: PatientProps) => {
  const { patientId } = params;
  const patient = await getPatientById(patientId);

  if (!patient) {
    return <div>Hasta bulunamadı.</div>;
  }

  return (
    <div className="flex flex-row justify-between mx-4 mt-4">
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
        <Button asChild variant="elevated">
          <Link href={`/dashboard/appointments/${patientId}`}>Randevu Al</Link>
        </Button>
      </div>
    </div>
  );
};

export default Patient;
