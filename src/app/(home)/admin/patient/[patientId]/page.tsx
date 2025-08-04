import { Button } from "@/components/ui/button";
import { getPatientById } from "@/lib/actions/patient.actions";
import { ExaminationHomePage } from "@/modules/ui/components/admin-page/examination-page/examination-ana-homepage";
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
    <div className="flex flex-col justify-between mx-4 mt-4 border p-3">
      <div className="flex flex-row justify-between items-center mb-5 mx-5 ">
        <div>
          <h1 className="font-bold text-xl">{patient.name}</h1>
        </div>
        <div>
          {patient.faceUrl ? (
            <Image
              src={patient.faceUrl}
              alt="Hasta Fotoğrafı"
              width={100}
              height={100}
              className="rounded-full object-cover"
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <p>Fotoğraf yok</p>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex w-[80%] ">
          <ExaminationHomePage patientId={patientId} />
        </div>
        <div className="flex flex-col gap-2 items-center w-[10%]">
          <div>
            <Button asChild variant="elevated">
              <Link href={`/admin/examinations/${patientId}/newexamination`}>
                Yeni Muayene
              </Link>
            </Button>
          </div>

          <div>
            <Button asChild variant="elevated">
              <Link href={`/admin/appointments/${patientId}`}>Randevu Al</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patient;
