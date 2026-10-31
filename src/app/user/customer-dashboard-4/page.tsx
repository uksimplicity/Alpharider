"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobilityShell, { MobilityIcon } from "@/app/components/MobilityShell";
import { getUserProfile, type UserProfile } from "@/lib/user-api";
import { clearAuthSession } from "@/lib/session";

const links = [
  { label: "Edit profile", text: "Keep your contact details up to date", href: "/user/edit-profile" },
  { label: "Your rides", text: "Active trips, schedules, and ride history", href: "/user/rides" },
  { label: "Delivery history", text: "Track the packages you send", href: "/user/delivery" },
  { label: "Wallet", text: "Payment availability", href: "/user/wallet" },
  { label: "Change password", text: "Manage your account security", href: "/user/change-password" },
  { label: "Settings", text: "Your account preferences", href: "/user/settings" },
];

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const token = localStorage.getItem("alpharider_token");
    if (!token) return;
    setLoading(true); setError("");
    try {
      const value = await getUserProfile(token);
      setProfile(value);
      const name = [value.first_name, value.last_name].filter(Boolean).join(" ");
      if (name) localStorage.setItem("alpharider_display_name", name);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load your profile."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Your account";
  return <MobilityShell>
    <p className="mobility-eyebrow">ALL IN ONE PLACE</p><h1>Your space.</h1><p className="mobility-muted">Your details, journeys, and preferences.</p>
    <section className="mobility-panel">
      {loading ? <p role="status">Loading profile…</p> : error ? <div role="alert"><p className="mobility-error">{error}</p><button className="mobility-button secondary" onClick={load}>Try again</button></div> : <div className="mobility-account-profile"><span className="mobility-profile-icon"><MobilityIcon name="account" /></span><div><h2>{name}</h2><p className="mobility-muted">{profile?.email || profile?.phone || "Add your contact details in Edit profile."}</p></div></div>}
    </section>
    <section className="mobility-account-links">{links.map(link => <Link key={link.href} className="mobility-panel mobility-link-panel" href={link.href}><div><h2>{link.label}</h2><p>{link.text}</p></div><MobilityIcon name="arrow" /></Link>)}</section>
    <div className="mobility-title-row"><Link className="mobility-button secondary" href="/rider">Become a driver or rider</Link><button className="mobility-button secondary" onClick={() => { clearAuthSession(); router.replace("/auth/login"); }}>Sign out</button></div>
  </MobilityShell>;
}
