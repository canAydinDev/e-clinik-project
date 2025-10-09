import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

import { StatCard } from "../../stat-card";
import { columns } from "@/modules/ui/components/table/columns";

import { DataTable2 } from "../../appointment-page/all-appointment-home-page/index-2";

// AdminAppointmentPage (server component)
export const AdminAppointmentPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="w-full flex flex-col gap-6 mx-5 min-w-0">
      {/* max-w-7xl ve mx-auto kaldırıldı */}
      <main className="w-full flex flex-col gap-6">
        {/* items-center yerine varsayılan: stretch */}
        {/* Kartlar da tam genişlikte ve responsive olsun */}
        <section className="hidden md:flex w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Planlanmış Randevular"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="İptal Edilen Randevular"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        {/* Tabloyu yatayda kaydırılabilir sarmalayıcıya al */}
        <div className="w-full overflow-x-auto">
          <DataTable2 columns={columns} data={appointments.documents} />
        </div>
      </main>
    </div>
  );
};
