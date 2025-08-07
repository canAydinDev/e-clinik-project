import { AppointmentPage } from "@/modules/ui/components/appointment-page/appointmentHomePage";

interface PatientProps {
  params: Promise<{ patientId: string }>;
}

const Patient = async ({ params }: PatientProps) => {
  const { patientId } = await params;

  return (
    <div>
      <AppointmentPage patientId={patientId} />
    </div>
  );
};

export default Patient;
