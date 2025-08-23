// src/modules/ui/components/admin-page/patients/homepage.tsx
"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { patientColumns } from "@/modules/ui/components/table/patient-columns";
import { AdminPatientDataTable } from "../../table/admin-patient-table";
import { SearchInput } from "../../search-filter/search-input";

export const AdminPatientsHomePage = () => {
  const trpc = useTRPC();

  const [input, setInput] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);

  const patients = useQuery(trpc.patients.getMany.queryOptions({ q }));

  return (
    <div className="w-full flex flex-col gap-6 mx-5">
      {/* max-w-7xl KALDIRILDI */}
      <main className="w-full flex flex-row items-stretch gap-2">
        {/* px-[5%] ve xl:px-12 KALDIRILDI */}
        <div className="flex-1 min-w-0">
          {/* flex-5 yerine flex-1 + min-w-0 */}
          <SearchInput
            value={input}
            onChange={setInput}
            onSubmit={() => setQ(input.trim() || undefined)}
            loading={patients.isFetching}
          />

          <div className="w-full overflow-x-auto">
            {/* geniş tablo için taşmayı engeller */}
            <AdminPatientDataTable
              columns={patientColumns}
              data={patients.data ?? []}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
