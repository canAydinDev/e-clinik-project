import { AdminPatientsHomePage } from "../../patient-page/admin-patients-home-page";
import { AdminAppointmentPage } from "../admin-appointment-page";

export const AdminHomePage = () => {
  return (
    <section className="flex flex-col xl:flex-row mt-10 gap-1">
      <div className="flex  ">
        <AdminPatientsHomePage />
      </div>
      <div className="flex ">
        <AdminAppointmentPage />
      </div>
    </section>
  );
};
