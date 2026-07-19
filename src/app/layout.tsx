import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SeasonProvider } from "@/context/SeasonContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seasonal Hobby Hub | Secondary Brain",
  description: "A distraction-free, high-performance web application designed to counter decision paralysis and alleviate the cognitive friction associated with rotating multi-domain hobbies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full transition-season-all`}>
        <SeasonProvider>
          {children}
        </SeasonProvider>
      </body>
    </html>
  );
}
