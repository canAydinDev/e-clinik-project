// src/modules/users/server/procedures.ts (veya ilgili yol)
import { getUsers } from "@/lib/server/appwrite";
import { parseStringify } from "@/lib/utils";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { User } from "../../../../types/form";

export const usersRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    try {
      const users = getUsers(); // ✅ lazy getter
      const allUsers = await users.list(); // Appwrite: Users.list(queries?, search?)
      return parseStringify(allUsers.users) as User[];
    } catch (error) {
      console.log("Kullanicilar getirilemedi", error);
      return [];
    }
  }),
});
