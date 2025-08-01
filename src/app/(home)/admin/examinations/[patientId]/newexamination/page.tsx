import { ExaminationPage } from "@/modules/ui/components/admin-page/examination-page/examination-home-page";

interface PageProps {
  params: { patientId: string };
}

const Page = ({ params }: PageProps) => {
  return (
    <div>
      <div></div>
      <ExaminationPage patientId={params.patientId} />
    </div>
  );
};

export default Page;
