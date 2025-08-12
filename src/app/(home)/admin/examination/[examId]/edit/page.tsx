import { getExaminationByExamId } from "@/lib/actions/examinations.actions";
import { EditExaminationForm } from "@/modules/ui/components/admin-page/examination-page/update-examination-form";

interface PageProps {
  params: Promise<{ examId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { examId } = await params;
  const exam = await getExaminationByExamId(examId);

  if (!exam) return <div>Muayene bulunamadı.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <EditExaminationForm
        examinationId={exam.$id}
        initialValues={{
          procedure: exam.procedure,
          doctorNote: exam.doctorNote ?? undefined, // <-- null → undefined
          date: exam.date ?? undefined, // (form tipin date?: string | undefined ise)
          nextControlDate: exam.nextControlDate ?? undefined, // <-- null → undefined
        }}
      />
    </div>
  );
};

export default Page;
