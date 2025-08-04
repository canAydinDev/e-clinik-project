import { getPatientById } from "@/lib/actions/patient.actions";
import { ExaminationHomePage } from "@/modules/ui/components/admin-page/examination-page/examination-ana-homepage";
import Image from "next/image";

interface PageProps {
  params: { patientId: string };
}

const Page = async ({ params }: PageProps) => {
  const { patientId } = params;

  const patient = await getPatientById(patientId);

  if (!patient) {
    return <div>Hasta bulunamadı.</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div>
          <h2>{patient.name}</h2>

          <div>
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
      </div>
      <div className="flex">
        <ExaminationHomePage patientId={patientId} />
      </div>
    </div>
  );
};

export default Page;
