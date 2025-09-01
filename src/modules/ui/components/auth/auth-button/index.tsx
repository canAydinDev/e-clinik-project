"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircleIcon } from "lucide-react";
import { logout } from "@/lib/client/auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AuthButton = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await logout(); // sizin local logout
    await signOut(); // Clerk çıkışı
  };

  return (
    <>
      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Hesap menüsü"
              className="rounded-full outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl || undefined} />
                <AvatarFallback>
                  {(user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
