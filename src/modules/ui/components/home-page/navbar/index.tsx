"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarSidebar } from "../navbar-sidebar";
import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";

import { AuthButton } from "../../auth/auth-button";
import { NavbarItem } from "../navbar-items";
import { getCurrentUser } from "@/lib/client/auth";

const playFair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

export const Navbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userId, setUser] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const current = await getCurrentUser();
        setUser(current.$id);
      } catch (e) {
        console.error(e);
        if (mounted) setUser("");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const navbarItems = [
    { href: "/dashboard/patients", children: "Hastalar" },
    { href: "/dashboard/appointments", children: "Randevular" },

    ...(userId
      ? [
          {
            href: `/dashboard/patients/${userId}/register`,
            children: "Yeni Kayıt",
          },
        ]
      : []),
  ];
  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-[#e6ddde] pr-5">
      <div className="flex items-center w-full gap-4 justify-between">
        <Link href="/dashboard" className="pl-6 my-auto flex items-center ">
          <span
            className={cn(
              "text-2xl md:text-5xl font-semibold text-[#654a4e]",
              playFair.className
            )}
          >
            SahinKlinik
          </span>
        </Link>
        <NavbarSidebar
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          items={navbarItems}
        />

        <div className="items-center gap-4 hidden lg:flex ">
          {navbarItems.map((item) => (
            <NavbarItem
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
            >
              {item.children}
            </NavbarItem>
          ))}
        </div>

        <div className="flex lg:hidden items-center justify-center ">
          <Button
            variant="ghost"
            className="size-12 border-transparent bg-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon />
          </Button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-4 ">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
