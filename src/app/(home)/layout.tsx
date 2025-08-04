import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.patients.getMany.queryOptions());
  void queryClient.prefetchQuery(trpc.users.getMany.queryOptions());
  void queryClient.prefetchQuery(trpc.examinations.getMany.queryOptions());

  return (
    <div className="flex flex-col min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default Layout;
