"use client";
import Link from "next/link";
import { useState } from "react";
import RiderShell, { Message, riderStyles as styles } from "@/app/components/RiderShell";
import RiderAvailability from "@/app/components/RiderAvailability";
import { useBackend } from "@/lib/hooks/use-backend";
import { amount, normalizeProfile, profileName, money, unwrap, type Availability } from "@/lib/backend-data";
import RiderInbox from "@/app/components/RiderInbox";

export default function DashboardPage() {
  const profile = useBackend("/user/profile"), wallet = useBackend("/wallet/balance", 30000), unread = useBackend("/user/notifications/unread-count", 30000);
  const [status, setStatus] = useState<Availability | null>(null), [showBalance, setShowBalance] = useState(false);
  let name = "", profileError = profile.error;
  try { if (profile.data) name = profileName(normalizeProfile(profile.data)); } catch (cause) { profileError = cause instanceof Error ? cause.message : "Could not read profile."; }
  return <RiderShell><div><p className={styles.muted}>{new Date().toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "full" })}</p><h1>{name ? `Hello, ${name}!` : "Rider dashboard"}</h1></div><Message error={profileError} />
    <div className={styles.grid}><section className={styles.card}><h2>Wallet balance</h2><p className={styles.metric}>{wallet.loading ? "Loading…" : wallet.error ? "Unavailable" : showBalance ? money(amount(wallet.data)) : "••••"}</p><Message error={wallet.error} /><div className={styles.actions}><button onClick={() => setShowBalance(value => !value)}>{showBalance ? "Hide balance" : "Show balance"}</button><Link className={styles.link} href="/rider/wallet">Open wallet</Link></div></section><RiderAvailability onStatus={setStatus} /></div>
    <RiderInbox status={status} />
    <section className={styles.card}><h2>Your account</h2><div className={styles.actions}><Link className={styles.link} href="/rider">Profile & vehicle details</Link><Link className={styles.link} href="/rider/earnings">Delivery earnings</Link><Link className={styles.link} href="/rider/notifications">Notifications{typeof unwrap(unread.data).unread_count === "number" ? ` (${unwrap(unread.data).unread_count})` : ""}</Link><Link className={styles.link} href="/rider/messages">Messages & support</Link></div></section>
  </RiderShell>;
}
