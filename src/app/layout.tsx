import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IPL Auction Game",
  description: "Real-time multiplayer IPL auction simulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
