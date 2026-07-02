import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter, Space_Grotesk, Geist } from "next/font/google"; // 1. Import fonts
import { Toaster } from "@/components/ui/sonner"
import { NavbarWrapper } from "@/components/NavbarWrapper"; // <--- Update this import path
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

//Configure Inter (sans)
const geist = Geist({subsets:['latin'],variable:'--font-sans'});

//Configure Space Grotesk (display)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RepairLy",
  description: "Marketplace for repairs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
        <body
        className={`${geist.variable} ${spaceGrotesk.variable} relative antialiased bg-deepCarbon text-foreground`}
      >
          <NavbarWrapper />
          {children}
          <Footer/>
          <Toaster position="top-center" />
      </body>
    </html>
  );
}
