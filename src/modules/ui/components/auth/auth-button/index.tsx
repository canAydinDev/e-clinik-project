"use client";

import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  useClerk,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserCircleIcon, LogOut } from "lucide-react";
import { logout } from "@/lib/client/auth";

export const AuthButton = () => {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await logout(); // kendi logout fonksiyonun
    await signOut(); // clerk çıkışı
  };

  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Action
              label="Çıkış Yap"
              labelIcon={<LogOut className="size-4" />}
              onClick={handleLogout}
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
          >
            <UserCircleIcon className="mr-2 h-4 w-4" />
            Giriş
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};
