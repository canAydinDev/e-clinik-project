"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarSidebar } from "../navbar-sidebar";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { logout } from "@/lib/client/auth";

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
  { href: "/dashboard/patients", children: "Hastalar" },
  { href: "/dashboard/appointments", children: "Randevular" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/dashboard" className="pl-6 my-auto flex items-center">
        <span
          className={cn(
            "text-5xl font-semibold text-[#654a4e]",
            playFair.className
          )}
        >
          MyKlinik
        </span>
      </Link>
      <NavbarSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        items={navbarItems}
      />

      <div className="items-center gap-4 hidden lg:flex">
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
      <div className="items-center hidden lg:flex mr-3 ">
        <Button asChild onClick={() => logout()}>
          <Link href="/">Çıkış</Link>
        </Button>
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
