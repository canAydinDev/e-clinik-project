"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { AdminNavbarSidebar } from "../adminSidebarPage";

const playFair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      variant="outline"
      asChild
      className={cn(
        "bg-transparent hover:bg-transparent text-lg px-3.5 rounded-full hover:border-primary border-transparent",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const navbarItems = [
  { href: "/admin/patients", children: "Hastalar" },
  { href: "/admin/appointments", children: "Randevular" },
  { href: "/admin/users", children: "Kullanici Islemleri" },
];

export const AdminNavbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white ">
      <Link href="/admin" className="pl-6 my-auto flex items-center">
        <span
          className={cn(
            "text-5xl font-semibold text-[#654a4e]",
            playFair.className
          )}
        >
          Admin
        </span>
      </Link>
      <AdminNavbarSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        items={navbarItems}
      />

      <div className="items-center gap-4 hidden lg:flex mr-8 ">
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

      <div className="flex lg:hidden items-center justify-center">
        <Button
          variant="ghost"
          className="size-12 border-transparent bg-white"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};
