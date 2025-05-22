import { AestheticBackground } from "@/components/ui/aesthetic-background";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const satoshi = localFont({
  src: "../styles/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "100 200 300 400 500 600 700 800 900",
  display: "swap",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Fact Checker | AI-powered factual verification",
  description:
    "Verify factual accuracy using our modular LangGraph system that extracts claims, cross-references them with real-world evidence, and provides a detailed verification report.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

const RootLayout = ({ children }: Readonly<React.PropsWithChildren>) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={cn(
        "bg-neutral-50 font-[family-name:var(--font-satoshi)] antialiased",
        "selection:bg-neutral-700 selection:text-white dark:selection:bg-white dark:selection:text-neutral-700",
        satoshi.variable,
        geistMono.variable
      )}
    >
      <AestheticBackground />
      {children}
    </body>
  </html>
);

export default RootLayout;
