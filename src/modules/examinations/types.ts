import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

// Examination listesi için
export type ExaminationsGetManyOutput =
  inferRouterOutputs<AppRouter>["examinations"]["getManyByPatientId"];
export type ExaminationsGetManyOutputSingle = ExaminationsGetManyOutput[0];
