"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { ExaminationDataTable } from "../examination-data-table";
import { examinationColumns } from "../examination-column";

interface ExaminationHomePageProps {
  patientId: string;
}

export const ExaminationHomePage = ({
  patientId,
}: ExaminationHomePageProps) => {
  const trpc = useTRPC();
  const examinations = useQuery(
    trpc.examinations.getManyByPatientId.queryOptions(patientId)
  );

  return (
    <div className="w-full lg:ml-5 flex max-w-7xl flex-col space-y-6">
      <main className="w-full flex flex-row justify-center">
        <div className="flex-5 w-full max-w-full">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Geçmiş Muayeneler
          </h2>
          <ExaminationDataTable
            columns={examinationColumns}
            data={examinations.data ?? []}
          />
        </div>
      </main>
    </div>
  );
};
