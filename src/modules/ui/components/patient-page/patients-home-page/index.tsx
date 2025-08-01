"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { patientColumns } from "@/modules/ui/components/table/patient-columns";
import { AdminPatientDataTable } from "../../table/admin-patient-table";
import { SearchInput } from "../../search-input";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/client/auth";
import { Models } from "appwrite";
import { UserPatientDataTable } from "../../table/user-patient-table";

export const PatientsHomePage = () => {
  const trpc = useTRPC();
  const patients = useQuery(trpc.patients.getMany.queryOptions());

  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  return (
    <div className="ml-5 flex max-w-7xl flex-col space-y-14">
      <div>
        <h1 className="text-[32px] font-bold md:text-[36px]">
          {user ? `Hoş geldiniz, ${user.name}` : "Yükleniyor..."}
        </h1>
      </div>

      <main className="flex flex-row items-center space-y-6 px-[5%] xl:space-y-12 xl:px-12 gap-2">
        <div className="flex-5 w-full">
          <SearchInput />

          {user?.name === "admin" ? (
            <AdminPatientDataTable
              columns={patientColumns}
              data={patients.data ?? []}
            />
          ) : (
            <UserPatientDataTable
              columns={patientColumns}
              data={patients.data ?? []}
            />
          )}
        </div>
      </main>
    </div>
  );
};
