import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/provider/SessionProvider";
import { TRPCProvider } from "@/trpc/provider";
import { ThemeProvider } from "@/components/provider/ThemeProvider";

const rubik = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Career Counselor",
  description: "Get personalized career guidance from AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <SessionProvider>
          <ThemeProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
