import { DashboardPatientsHomePage } from "../patient-page/dashboard-patients-homepage";
import { DaySchedulePanel } from "../appointment-page/day-schedule-panel";

export const DashboardPage = () => {
  return (
    <div className="mx-2 my-2 flex flex-col gap-4 md:mx-5 xl:mx-10">
      <DashboardPatientsHomePage />
      <DaySchedulePanel title="Bugünkü Randevular" />
    </div>
  );
};
