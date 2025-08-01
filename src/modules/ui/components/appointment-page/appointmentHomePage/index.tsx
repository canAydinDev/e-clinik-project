import { NewAppointmentPage } from "../newAppointmentPage";

export const AppointmentPage = ({ patientId }: { patientId: string }) => {
  return (
    <div>
      <div>
        <NewAppointmentPage patientId={patientId} />
      </div>
    </div>
  );
};
