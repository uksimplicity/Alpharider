import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import SessionManager from "./components/SessionManager";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AlphaRider | Delivery & Mobility Partner",
  description:
    "A modern rider app experience for fast, safe, and reliable deliveries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${manrope.variable}`}>
        <SessionManager />
        {children}
      </body>
    </html>
  );
}
