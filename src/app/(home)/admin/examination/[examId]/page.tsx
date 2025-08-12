// src/app/(home)/admin/examination/[examId]/page.tsx
import { getExaminationByExamId } from "@/lib/actions/examinations.actions";
import {
  databases,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
} from "@/lib/server/appwrite";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteExaminationButton } from "@/modules/ui/components/admin-page/examination-page/delete-examination";
import { Patient } from "../../../../../../types/appwrite.types";

interface PageProps {
  params: { examId: string };
}

const Page = async ({ params }: PageProps) => {
  const { examId } = params;

  const exam = await getExaminationByExamId(examId);
  if (!exam) {
    return <div>Muayene bulunamadı.</div>;
  }

  // exam.patientId = string (hasta dokümanının ID'si)
  const patientId: string = exam.patientId;

  // Hasta dokümanını getir
  let patient: Patient | null = null;
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      PATIENT_COLLECTION_ID!,
      patientId
    );
    patient = doc as unknown as Patient;
  } catch {
    patient = null;
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="flex flex-row justify-between items-center mb-5 mx-5">
        <div>
          <Link
            href={`/admin/patient/${patient ? patient.$id : patientId}`}
            className="font-bold text-xl"
          >
            {patient?.name ?? "Hasta"}
          </Link>
        </div>

        <div>
          {patient?.faceUrl ? (
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

      <div className="flex flex-col md:flex-row gap-4 mx-auto">
        <div className="flex w-full md:w-[30%] rounded-xl border min-h-[200px] p-4 flex-col items-center">
          <h2 className="font-semibold text-lg">İşlem</h2>
          <p>{exam.procedure}</p>
        </div>

        <div className="flex w-full md:w-[30%] rounded-xl border min-h-[200px] p-4 flex-col items-center">
          <h2 className="font-semibold text-lg">Not</h2>
          <p>{exam.doctorNote ?? "—"}</p>
        </div>

        <div className="flex flex-col gap-2 m-2">
          <Button asChild variant="greenElevated">
            <Link href={`/admin/examination/${examId}/edit`}>
              Muayeneyi Düzenle
            </Link>
          </Button>

          <DeleteExaminationButton
            examinationId={examId}
            redirectTo={`/admin/patient/${patient ? patient.$id : patientId}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
