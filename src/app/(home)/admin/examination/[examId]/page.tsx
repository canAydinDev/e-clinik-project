import { getExaminationByExamId } from "@/lib/actions/examinations.actions";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProp {
  params: { examId: string };
}

const Page = async ({ params }: PageProp) => {
  const { examId } = params;

  const exam = await getExaminationByExamId(examId);
  const patient = exam.patientId;

  if (!exam) {
    return <div>Muayene bulunamadı.</div>;
  }

  return (
    <div className="p-6 ">
      <div className="flex flex-row justify-between items-center mb-5 mx-5 ">
        <div>
          <Link
            href={`/admin/patient/${patient.$id}`}
            className="font-bold text-xl"
          >
            {patient.name}
          </Link>
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

      <div className="flex flex-row gap-4 mx-auto">
        <div className="flex border min-h-[200px] w-[30%] p-4 flex-col items-center">
          <h2 className="font-semibold text-lg">Islem</h2>
          <p>{exam.procedure}</p>
        </div>

        <div className="flex border min-h-[200px] w-[30%] p-4 flex-col items-center">
          <h2 className="font-semibold text-lg">Not</h2>
          <p>{exam.doctorNote}</p>
        </div>

        <div className="flex flex-col gap-2 m-2">
          <Button variant="elevated">Muayeneyi Duzenle</Button>
          <Button variant="elevated">Muayeneyi Sil</Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
