import { AdminPatientsHomePage } from "../../patient-page/admin-patients-home-page";
import { AdminAppointmentPage } from "../admin-appointment-page";

export const AdminHomePage = () => {
  return (
    <section className="flex flex-col xl:flex-row mt-3 mx-2 gap-1">
      <div className="flex w-full  ">
        <AdminPatientsHomePage />
      </div>
      <div className="flex w-full">
        <AdminAppointmentPage />
      </div>
    </section>
  );
};
