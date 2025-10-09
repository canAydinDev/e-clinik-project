import { DashboardAppointmentPage } from "@/modules/ui/components/appointment-page/dashboard-appointmentHomePage";

interface PatientProps {
  params: Promise<{ patientId: string }>;
}

const Patient = async ({ params }: PatientProps) => {
  const { patientId } = await params;

  return (
    <div>
      <DashboardAppointmentPage patientId={patientId} />
    </div>
  );
};

export default Patient;
