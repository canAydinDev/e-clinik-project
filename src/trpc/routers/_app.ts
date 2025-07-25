import { patientsRouter } from "@/modules/patients/server/procedures";
import { createTRPCRouter } from "../init";
import { usersRouter } from "@/modules/users/server/procedures";
export const appRouter = createTRPCRouter({
  users: usersRouter,
  patients: patientsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
