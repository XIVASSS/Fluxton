import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans-loaded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "fluxton · Depot Control",
  description:
    "Monitor charging infrastructure, active sessions, faults, and usage from a single depot dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <div className="dawn-glow" aria-hidden />
        {children}
      </body>
    </html>
  );
}
