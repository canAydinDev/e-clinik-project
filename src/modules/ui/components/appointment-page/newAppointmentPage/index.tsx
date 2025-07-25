"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AppointmentForm } from "../appointment-form";
import { getCurrentUser } from "@/lib/client/auth";

interface NewAppointmentPageProps {
  searchParams?: { [key: string]: string | undefined };
  patientId: string;
}

export const NewAppointmentPage = ({
  searchParams,
  patientId,
}: NewAppointmentPageProps) => {
  const isAdmin = searchParams?.admin === "true";
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let finalUserId: string;

        if (!isAdmin) {
          const user = await getCurrentUser();
          finalUserId = user?.$id;
        } else {
          finalUserId = "6883b29700098b661379";
        }

        setUserId(finalUserId);
      } catch (error) {
        console.warn("Kullanıcı girişi yok veya token süresi dolmuş:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAdmin]);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="flex h-screen max-h-screen">
      <section className="container my-auto">
        <div className="mx-auto flex size-full flex-col py-10 max-w-[860px] flex-1 justify-between">
          <div className="flex items-center justify-center mx-auto my-10 text-2xl">
            <h1>
              <span className="font-bold">Ş</span>AHINO{" "}
              <span className="font-semibold text-green-300">KLINIK</span>
            </h1>
          </div>

          <AppointmentForm
            type="create"
            userId={userId}
            patientId={patientId}
            setOpen={() => {}}
          />

          <p className="justify-items-end text-gray-600 xl:text-left">
            © 2024 ŞahinoKlinik
          </p>
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="randevu"
        className="side-img max-w-[360px] bg-bottom"
      />
    </div>
  );
};
