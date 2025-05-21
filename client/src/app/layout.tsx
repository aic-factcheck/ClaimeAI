import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fact Checker | AI-powered factual verification",
  description:
    "Verify the accuracy of information with our AI-powered fact checking tool",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

const RootLayout = ({ children }: Readonly<React.PropsWithChildren>) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={cn(
        "antialiased font-[family-name:var(--font-geist-sans)] bg-white",
        geistSans.variable,
        geistMono.variable
      )}
    >
      {children}
    </body>
  </html>
);

export default RootLayout;
