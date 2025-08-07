import { AppointmentPage } from "@/modules/ui/components/appointment-page/appointmentHomePage";

interface PatientProps {
  params: { patientId: string };
}

const Patient = async ({ params }: PatientProps) => {
  const { patientId } = params;

  return (
    <div>
      <AppointmentPage patientId={patientId} />
    </div>
  );
};

export default Patient;
