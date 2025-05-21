import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Image Tools",
  description: "Batch resize & background remover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={oswald.variable}>
      <body className="antialiased">
        {/* -------- фиксированная шапка -------- */}
        <Navbar className="fixed top-0 inset-x-0 z-50" />

        {/* -------- контент с отступом -------- */}
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
