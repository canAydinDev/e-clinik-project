"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { patientColumns } from "@/modules/ui/components/table/patient-columns";
import { AdminPatientDataTable } from "../../table/admin-patient-table";
import { SearchInput } from "../../search-input";

export const AdminPatientsHomePage = () => {
  const trpc = useTRPC();
  const patients = useQuery(trpc.patients.getMany.queryOptions());

  return (
    <div className="ml-5 flex max-w-7xl flex-col space-y-14">
      <main className="flex flex-row items-center space-y-6 px-[5%] xl:space-y-12 xl:px-12 gap-2">
        <div className="flex-5 w-full">
          <SearchInput />

          <AdminPatientDataTable
            columns={patientColumns}
            data={patients.data ?? []}
          />
        </div>
      </main>
    </div>
  );
};
