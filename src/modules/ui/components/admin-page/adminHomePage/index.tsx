import { PatientsHomePage } from "../../patient-page/patients-home-page";
import { AdminAppointmentPage } from "../admin-appointment-page";

export const AdminHomePage = () => {
  return (
    <section className="flex flex-col xl:flex-row mt-10 gap-10">
      <div className="flex-2 mx-auto">
        <PatientsHomePage />
      </div>
      <div className="flex-1">
        <AdminAppointmentPage />
      </div>
    </section>
  );
};
