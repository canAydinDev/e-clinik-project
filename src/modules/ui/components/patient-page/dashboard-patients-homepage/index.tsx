// src/modules/ui/components/admin-page/patients/dashboard-homepage.tsx
"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { patientColumns } from "@/modules/ui/components/table/patient-columns";
import { SearchInput } from "../../search-filter/search-input";
import { UserPatientDataTable } from "../../table/user-patient-table";

export const DashboardPatientsHomePage = () => {
  const trpc = useTRPC();

  // Arama durumu
  const [input, setInput] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);

  // q değiştiğinde listeyi getir
  const patients = useQuery(trpc.patients.getMany.queryOptions({ q }));

  return (
    <div className="w-full flex flex-col gap-6">
      {/* max-w / margin yok */}
      <main className="w-full flex flex-row items-stretch gap-2">
        {/* px-* yok */}
        <div className="flex-1 min-w-0">
          <SearchInput
            value={input}
            onChange={setInput}
            onSubmit={() => setQ(input.trim() || undefined)}
            loading={patients.isFetching}
          />

          <div className="w-full overflow-x-auto">
            <UserPatientDataTable
              columns={patientColumns}
              data={patients.data ?? []}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
