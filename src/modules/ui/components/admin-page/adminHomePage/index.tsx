import { AdminPatientsHomePage } from "../../patient-page/admin-patients-home-page";
import { AdminAppointmentPage } from "../admin-appointment-page";
import { DaySchedulePanel } from "../../appointment-page/day-schedule-panel";

export const AdminHomePage = () => {
  return (
    <div className="flex flex-col gap-4 mx-2 mt-3">
      <section className="flex flex-col gap-1 xl:flex-row">
        <div className="flex w-full">
          <AdminPatientsHomePage />
        </div>
        <div className="flex w-full">
          <AdminAppointmentPage />
        </div>
      </section>
      <DaySchedulePanel />
    </div>
  );
};
