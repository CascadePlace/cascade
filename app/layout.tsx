import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AiideDevBridge } from "./aiide-dev-bridge";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dan Swart — Portfolio",
  description:
    "Portfolio of Dan Swart — designer & developer crafting bold digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // Browser extensions (password managers, unit/currency converters, etc.)
        // often inject attributes onto <body> before React hydrates, which would
        // otherwise trip a dev-only hydration mismatch warning. This suppresses the
        // warning for <body>'s own attributes only — real mismatches inside the app
        // still surface.
        suppressHydrationWarning
      >
        {process.env.NODE_ENV !== "production" && <AiideDevBridge />}
        {children}
      </body>
    </html>
  );
}
