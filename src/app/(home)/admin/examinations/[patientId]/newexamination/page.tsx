import { ExaminationPage } from "@/modules/ui/components/admin-page/examination-page/examination-home-page";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { patientId } = await params;
  return (
    <div>
      <div></div>
      <ExaminationPage patientId={patientId} />
    </div>
  );
};

export default Page;
