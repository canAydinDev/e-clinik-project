"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export const PatientsHomePage = () => {
  const trpc = useTRPC();
  const patients = useQuery(trpc.patients.getMany.queryOptions());

  return (
    <section>
      <div>
        <h1>Hastalar</h1>
        {patients.data?.map((patient) => (
          <div
            key={patient.name}
            className="flex gap-2 border border-gray-600 mx-10"
          >
            <div>{patient.name || "İsimsiz Hasta"}</div>
            <div>{patient.email || "İsimsiz Hasta"}</div>
            {patient.faceUrl && (
              <div>
                <Image
                  src={`${patient?.faceUrl}`}
                  alt="patient Pic"
                  height={100}
                  width={100}
                  objectFit="cover"
                />
              </div>
            )}
            <Link href={`/admin/patient/${patient.$id}`}>sayfasi</Link>
          </div>
        ))}
      </div>
    </section>
  );
};
