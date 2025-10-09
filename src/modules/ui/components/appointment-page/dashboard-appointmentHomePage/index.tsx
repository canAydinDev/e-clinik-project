"use client";

import { getCurrentUser } from "@/lib/client/auth";
import { useEffect, useState } from "react";
import { DashboardAppointmentCreateForm } from "../dashboard-appointment-create-form";

export const DashboardAppointmentPage = ({
  patientId,
}: {
  patientId: string;
}) => {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getMyUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.$id);
        }
      } catch {
        // Kullanıcı giriş yapmamış → form gösterilmeye devam edilir
      }
    };

    getMyUser();
  }, []);

  return (
    <div className="mx-10">
      <DashboardAppointmentCreateForm patientId={patientId} userId={userId} />
    </div>
  );
};
