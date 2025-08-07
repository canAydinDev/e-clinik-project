import { AppointmentPage } from "@/modules/ui/components/appointment-page/appointmentHomePage";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { patientId } = await params;

  return (
    <div>
      <AppointmentPage patientId={patientId} />
    </div>
  );
};

export default Page;
