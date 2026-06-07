import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BootAnimation from "@/components/BootAnimation";
import CustomCursor from "@/components/CustomCursor";
import { MobileNav } from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "Versescan - Vulnerability Scanner",
  description: "Next-gen AI-Powered Vulnerability Scanner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans aurora-bg selection:bg-white/20`}>
        <BootAnimation />
        <CustomCursor />
        <MobileNav />
        <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-[5]"></div>
        <main className="h-dvh flex flex-col pt-16 lg:pt-0 relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
