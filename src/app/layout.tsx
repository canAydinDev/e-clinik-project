import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Clinic",
  description: "My Last E Clinic Web Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={`${dmSans.className} $ antialiased`}>
          <TRPCReactProvider>
            {children}
            <Toaster richColors position="top-center" />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
