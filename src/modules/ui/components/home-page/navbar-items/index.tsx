"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  return (
    <Button
      variant="outline"
      asChild
      onClick={(e) => {
        if (!isSignedIn) {
          e.preventDefault();
          return clerk.openSignIn();
        }
      }}
      className={cn(
        "bg-transparent hover:bg-transparent text-lg px-3.5 rounded-full hover:border-primary border-transparent",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};
