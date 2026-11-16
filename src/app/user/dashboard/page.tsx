"use client";
import Link from "next/link";
import MobilityShell, { MobilityIcon } from "@/app/components/MobilityShell";
import CustomerDeliveryList from "@/app/components/CustomerDeliveryList";

export default function UserDashboardPage() {
  return <MobilityShell>
    <section className="mobility-intro"><p className="mobility-eyebrow">ALPHA SEND</p><h1>Your packages, on the move.</h1><p>Send a package and follow its delivery in one place.</p></section>
    <Link className="mobility-hero" href="/user/package-information-3"><div><p className="mobility-eyebrow">READY TO SEND?</p><h2>From your doorstep<br />to theirs.</h2><span className="mobility-search">Send a package <MobilityIcon name="arrow" /></span></div><div className="mobility-hero-art" aria-hidden="true"><MobilityIcon name="package" /><span>ALPHA SEND</span></div></Link>
    <section><h2>Your delivery essentials</h2><div className="mobility-services">
      {[
        { href: "/user/package-information-3", icon: "package" as const, title: "Alpha Send", text: "Send a package" },
        { href: "/user/delivery", icon: "package" as const, title: "Your deliveries", text: "Track active and past deliveries" },
        { href: "/user/in-app-chat", icon: "account" as const, title: "Support", text: "Get help with a delivery" },
      ].map(item => <Link className="mobility-service" key={item.title} href={item.href}><MobilityIcon name={item.icon} /><h3>{item.title}</h3><p>{item.text}</p><MobilityIcon name="arrow" /></Link>)}
    </div></section>
    <CustomerDeliveryList activeOnly />
    <section className="mobility-two-col"><Link className="mobility-panel mobility-link-panel" href="/user/wallet"><MobilityIcon name="account" /><div><h2>Your wallet.</h2><p>Check your balance and transaction history.</p></div><MobilityIcon name="arrow" /></Link><Link className="mobility-panel mobility-link-panel" href="/user/notification"><MobilityIcon name="package" /><div><h2>Keep up to date.</h2><p>Read your delivery and account notifications.</p></div><MobilityIcon name="arrow" /></Link></section>
  </MobilityShell>;
}
