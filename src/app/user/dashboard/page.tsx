"use client";
import Link from "next/link";
import MobilityShell, { MobilityIcon } from "@/app/components/MobilityShell";

export default function UserDashboardPage() {
  return <MobilityShell>
    <section className="mobility-intro"><p className="mobility-eyebrow">YOUR EVERYDAY, ON THE MOVE</p><h1>Let’s hit the road.</h1><p>A ride across town. A little less effort.</p></section>
    <Link className="mobility-hero" href="/user/book-ride"><div><p className="mobility-eyebrow">LET’S GET YOU THERE</p><h2>Your next stop<br />starts here.</h2><span className="mobility-search">Where are you going? <MobilityIcon name="arrow" /></span></div><div className="mobility-hero-art" aria-hidden="true"><MobilityIcon name="car" /><span>ALPHA RIDE</span></div></Link>
    <section><h2>Go your way</h2><div className="mobility-services">
      {[
        { href: "/user/book-ride", icon: "car" as const, title: "Rides", text: "Leave now" },
        { href: "/user/schedule-ride", icon: "calendar" as const, title: "Schedule", text: "Plan ahead" },
        { href: "/user/upload-picture", icon: "package" as const, title: "Alpha Send", text: "Send a package" },
      ].map(item => <Link className="mobility-service" key={item.title} href={item.href}><MobilityIcon name={item.icon} /><h3>{item.title}</h3><p>{item.text}</p><MobilityIcon name="arrow" /></Link>)}
    </div></section>
    <section className="mobility-two-col"><Link className="mobility-panel mobility-link-panel" href="/user/rides"><MobilityIcon name="car" /><div><h2>Every journey, in one place.</h2><p>Check your active trip and revisit past rides.</p></div><MobilityIcon name="arrow" /></Link><Link className="mobility-panel mobility-link-panel" href="/user/delivery"><MobilityIcon name="package" /><div><h2>Something to send?</h2><p>Create a delivery or track an existing package.</p></div><MobilityIcon name="arrow" /></Link></section>
  </MobilityShell>;
}
