"use client";

import { getCurrentUser } from "@/lib/client/auth";
import { AppointmentCreateForm } from "../appointment-create-form";
import { useEffect, useState } from "react";

export const AppointmentPage = ({ patientId }: { patientId: string }) => {
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
      <AppointmentCreateForm patientId={patientId} userId={userId} />
    </div>
  );
};
