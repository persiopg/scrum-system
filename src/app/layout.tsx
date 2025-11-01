import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Menu } from "@/components/Menu";
import HeaderToggle from '@/components/HeaderToggle';
import HeaderSearch from '@/components/HeaderSearch';
import { ScrumProvider } from "@/context/ScrumContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Scrum",
  description: "Sistema de gestão Scrum com burndown chart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrumProvider>
          <div className="app-shell">
            <Menu />

            <div className="main-layout">
              <header className="topbar">
                <div className="flex items-center gap-3 w-full">
                  <HeaderToggle />
                  <div className="mx-auto w-full">
                    <HeaderSearch />
                  </div>
                </div>
              </header>

              <main className="main-content">{children}</main>
            </div>
          </div>
        </ScrumProvider>
      </body>
    </html>
  );
}
