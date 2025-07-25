import {headers as getHeaders} from "next/headers";

import { getAllUsers } from "@/lib/actions/patient.actions";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const usersRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const myUsers = getAllUsers();
    return myUsers;
  }),
});

export const authRouter  = createTRPCRouter({
  sessioin: baseProcedure.query(async () =>{
    const headers = await getHeaders()
    const session = await appwrite.auth({headers})
    return session ;
  })
})
