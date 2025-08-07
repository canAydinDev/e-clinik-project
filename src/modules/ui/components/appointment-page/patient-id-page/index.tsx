// ✅ Burası server component olarak tanımlı
import { AppointmentPage } from "@/modules/ui/components/appointment-page/appointmentHomePage";

interface PageProps {
  params: { patientId: string };
}

const Page = async ({ params }: PageProps) => {
  const { patientId } = params;

  return (
    <div>
      <AppointmentPage patientId={patientId} />
    </div>
  );
};

export default Page;
