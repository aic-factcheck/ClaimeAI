import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AestheticBackground from "@/components/ui/AestheticBackground";

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
        "antialiased font-[family-name:var(--font-geist-sans)] bg-neutral-50",
        geistSans.variable,
        geistMono.variable
      )}
    >
      {/* <div className="absolute inset-0 bg-gradient-to-t from-white h-screen w-full via-neutral-50/15 to-transparent"></div>{" "} */}
      <div className="relative"></div>
      <AestheticBackground />
      {children}
    </body>
  </html>
);

export default RootLayout;
