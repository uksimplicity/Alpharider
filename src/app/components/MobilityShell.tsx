"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import "../mobility.css";

export function MobilityIcon({ name }: { name: "car" | "calendar" | "package" | "home" | "account" | "arrow" }) {
  const paths = {
    car: "M5 11l2-6h10l2 6M4 11h16v8H4zM7 19v2m10-2v2M7 15h1m8 0h1",
    calendar: "M5 5h14v16H5zM8 3v4m8-4v4M5 10h14m-10 4h1m4 0h1m-6 3h1",
    package: "M3 7l9-5 9 5v10l-9 5-9-5V7zm0 0l9 5 9-5M12 12v10M7 4l10 5",
    home: "M3 11l9-8 9 8M5 9v12h14V9M9 21v-8h6v8",
    account: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3",
    arrow: "M4 12h16m-6-6 6 6-6 6",
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export default function MobilityShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return <div className="mobility-app">
    <header className="mobility-header"><Link href="/user/dashboard" aria-label="AlphaRide home"><Image src="/logo.png" width={140} height={40} alt="AlphaRide" style={{ objectFit: "contain" }} /></Link><Link className="mobility-account" href="/user/customer-dashboard-4"><MobilityIcon name="account" /><span>My account</span></Link></header>
    <main className="mobility-main">{children}</main>
    <nav className="mobility-nav" aria-label="Main navigation">
      {[
        { href: "/user/dashboard", label: "Home", icon: "home" as const },
        { href: "/user/rides", label: "Your rides", icon: "car" as const },
        { href: "/user/delivery", label: "Alpha Send", icon: "package" as const },
        { href: "/user/customer-dashboard-4", label: "Account", icon: "account" as const },
      ].map(item => <Link key={item.href} href={item.href} aria-current={path === item.href ? "page" : undefined}><MobilityIcon name={item.icon} /><span>{item.label}</span></Link>)}
    </nav>
  </div>;
}
