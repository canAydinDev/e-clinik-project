import { users } from "@/lib/server/appwrite";
import { parseStringify } from "@/lib/utils";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { User } from "../../../../types/form";

export const usersRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    try {
      const allUsers = await users.list();
      return parseStringify(allUsers.users) as User[];
    } catch (error) {
      console.log("Kullanicilar getirilemedi", error);
      return [];
    }
  }),
});
