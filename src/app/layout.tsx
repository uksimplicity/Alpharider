import type { Metadata } from "next";
import localFont from "next/font/local";
import SessionManager from "./components/SessionManager";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable.ttf",
  variable: "--font-display",
  weight: "400 700",
  display: "swap",
});

const manrope = localFont({
  src: "./fonts/Manrope-Variable.ttf",
  variable: "--font-body",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlphaRider | Delivery & Mobility Partner",
  description:
    "Book a ride, plan your next trip, and send packages with AlphaRide.",
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
