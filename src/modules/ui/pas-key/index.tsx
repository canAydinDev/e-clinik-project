"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { decryptKey, encryptKey } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const PasskeyModal = () => {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(true);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");

  const encryptedKey =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessKey")
      : null;

  useEffect(() => {
    const accessKey = encryptedKey && decryptKey(encryptedKey);
    if (path) {
      if (accessKey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
        setOpen(false);
        router.push("/admin");
      } else {
        setOpen(true);
      }
    }
  }, [encryptedKey]);

  const validatePasskey = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      const encryptedKey = encryptKey(passkey);
      localStorage.setItem("accessKey", encryptedKey);

      setOpen(false);
    } else {
      setError("Geçersiz şifre. Lütfen tekrar deneyin.");
    }
  };

  const closeModal = () => {
    setOpen(false);
    router.push("/");
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="space-y-5 bg-gray-200 border-gray-900 outline-none ">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex justify-between items-start">
            Yönetici girişi doğrulanıyor
            <Image
              src="/assets/icons/close.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => closeModal()}
              className="cursor-pointer"
            />
          </AlertDialogTitle>
          <AlertDialogDescription>
            Yönetici sayfasına erişim için şifrenizi girin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <InputOTP
            maxLength={6}
            value={passkey}
            onChange={(value) => setPasskey(value)}
          >
            <InputOTPGroup className="w-full flex justify-between">
              <InputOTPSlot
                className="text-36-bold justify-center flex border border-gray-400  rounded-lg size-16 gap-4"
                index={0}
              />
              <InputOTPSlot
                className="text-36-bold justify-center flex border border-gray-400  rounded-lg size-16 gap-4"
                index={1}
              />
              <InputOTPSlot
                className="text-36-bold justify-center flex border border-gray-400  rounded-lg size-16 gap-4"
                index={2}
              />

              <InputOTPSlot
                className="text-36-bold justify-center flex border border-gray-400  rounded-lg size-16 gap-4"
                index={3}
              />
              <InputOTPSlot
                className="text-36-bold justify-center flex border border-gray-400  rounded-lg size-16 gap-4"
                index={4}
              />
              <InputOTPSlot
                className="text-36-bold justify-center flex border border-gray-400  rounded-lg size-16 gap-4"
                index={5}
              />
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <p className="text-red-400 text-14-regular mt-4 flex justify-center ">
              {error}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={(e) => validatePasskey(e)}
            className="shad-primary-btn w-full"
          >
            Yönetici şifresini girin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
