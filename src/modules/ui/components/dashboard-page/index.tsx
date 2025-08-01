"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/client/auth";
import Link from "next/link";

export const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-[32px] font-bold md:text-[36px]">Dashboard</h1>
      <div>
        <Button asChild>
          <Link href="/" onClick={() => logout()}>
            Cikis
          </Link>
        </Button>
      </div>
    </div>
  );
};
