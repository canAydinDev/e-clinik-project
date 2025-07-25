import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type PatientsGetManyOutput =
  inferRouterOutputs<AppRouter>["patients"]["getMany"];
export type PatientsGetManyOutputSingle = PatientsGetManyOutput[0];
