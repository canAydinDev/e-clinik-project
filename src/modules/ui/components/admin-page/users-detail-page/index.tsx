"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const UsersDetailsPage = () => {
  const trpc = useTRPC();
  const users = useQuery(trpc.users.getMany.queryOptions());

  return (
    <section>
      <h1>Kullanıcılar</h1>
      {users.data?.map((user) => (
        <div key={user.$id} className="border p-2">
          <div>{user.name}</div>
          <div>{user.email}</div>
        </div>
      ))}
    </section>
  );
};
