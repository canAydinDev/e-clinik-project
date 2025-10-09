"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from "react";
import { MenuIcon, Settings } from "lucide-react";
import { AdminNavbarSidebar } from "../adminSidebarPage";
import { AuthButton } from "../../auth/auth-button";

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
const userId = "6883b29700098b661379";
const navbarItems = [
  { href: "/admin/patients", children: "Hastalar" },

  { href: "/admin/appointments", children: "Randevular" },
  { href: `/admin/patients/${userId}/register`, children: "Yeni Kayıt" },
];

export const AdminNavbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <nav className="h-15 md:h-20 flex  justify-between font-medium px-5 border-b bg-[#e6ddde]">
      <Link href="/admin" className="pl-6 my-auto flex items-center">
        <span
          className={cn(
            "text-xl md:text-5xl font-semibold text-[#654a4e]",
            playFair.className
          )}
        >
          Yönetim Paneli
        </span>
      </Link>
      <AdminNavbarSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        items={navbarItems}
      />

      <div className="items-center gap-4 hidden lg:flex mr-5 ">
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

      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition">
        <AuthButton />
        <Link href="/admin/users">
          <Settings size={30} />
        </Link>
      </div>
    </nav>
  );
};
