import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cinder — Stream Movies & TV",
  description: "Stream the latest movies and TV shows for free. Built by Mantle. Cinder brings you a cinematic experience with a vast library of content.",
  keywords: ["Cinder", "Mantle", "streaming", "movies", "TV shows", "free streaming"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased bg-background text-foreground grain-overlay`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
