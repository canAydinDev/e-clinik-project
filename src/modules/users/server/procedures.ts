// src/modules/users/server/procedures.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getUsers } from "@/lib/server/appwrite";
import { parseStringify } from "@/lib/utils";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { User } from "../../../../types/form";

export const usersRouter = createTRPCRouter({
  // ✅ listeleme (sende vardı)
  getMany: baseProcedure.query(async () => {
    try {
      const users = getUsers();
      const all = await users.list();
      return parseStringify(all.users) as User[];
    } catch (error) {
      console.log("Kullanicilar getirilemedi", error);
      return [];
    }
  }),

  // ✅ güncelleme
  update: baseProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        name: z.string().min(1, "İsim zorunludur"),
        email: z.string().email("Geçerli e-posta"),
        phone: z.string().trim().optional().nullable(),
        // opsiyonel şifre — doluysa değiştiririz
        password: z.string().min(6).optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, name, email, phone, password } = input;
      const users = getUsers();

      try {
        // Appwrite Users admin SDK çağrıları
        await users.updateName(userId, name);
        await users.updateEmail(userId, email);

        if (typeof phone === "string" && phone.trim().length > 0) {
          await users.updatePhone(userId, phone.trim());
        }
        if (typeof password === "string" && password.length >= 6) {
          await users.updatePassword(userId, password);
        }

        const updated = await users.get(userId);
        // frontend bu dönen değeri kullanmak zorunda değil ama faydalı
        return parseStringify(updated) as User;
      } catch (err) {
        console.error("users.update failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kullanıcı güncellenemedi",
        });
      }
    }),

  // ✅ silme
  delete: baseProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const users = getUsers();
      try {
        await users.delete(input.userId);
        return { success: true as const };
      } catch (err) {
        console.error("users.delete failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kullanıcı silinemedi",
        });
      }
    }),
});
