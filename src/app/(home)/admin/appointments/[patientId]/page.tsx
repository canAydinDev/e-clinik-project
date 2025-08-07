import { AppointmentPage } from "@/modules/ui/components/appointment-page/appointmentHomePage";

interface PageProps {
  params: { patientId: string };
}

const Patient = async ({ params }: PageProps) => {
  const { patientId } = params;

  return (
    <div>
      <AppointmentPage patientId={patientId} />
    </div>
  );
};

export default Patient;
