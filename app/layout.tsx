import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter, Space_Grotesk, Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { NavbarWrapper } from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
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
      <body className={`${geist.variable} ${spaceGrotesk.variable} relative antialiased bg-deepCarbon text-foreground`}>
        <Providers>
          <NavbarWrapper />
          <Analytics />
          {children}
          <Footer />
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
