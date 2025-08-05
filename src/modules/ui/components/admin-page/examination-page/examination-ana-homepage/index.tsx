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
    <div className="w-full ml-5 flex max-w-7xl flex-col space-y-14">
      <main className="w-full flex flex-row items-center space-y-6 px-[5%] xl:space-y-12 xl:px-12 gap-2">
        <div className="flex-5 w-full">
          <ExaminationDataTable
            columns={examinationColumns}
            data={examinations.data ?? []}
          />
        </div>
      </main>
    </div>
  );
};
