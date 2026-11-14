"use client";
import Link from "next/link";
import { useState } from "react";
import RiderShell, { Message, riderStyles as styles } from "@/app/components/RiderShell";
import RiderAvailability from "@/app/components/RiderAvailability";
import { useBackend } from "@/lib/hooks/use-backend";
import { amount, normalizeProfile, profileName, rows, text, money, unwrap, type Availability } from "@/lib/backend-data";
import { extractDeliveryId } from "@/lib/deliveries-api";

export default function DashboardPage() {
  const profile = useBackend("/user/profile"), wallet = useBackend("/wallet/balance", 30000), unread = useBackend("/user/notifications/unread-count", 30000);
  const [status, setStatus] = useState<Availability | null>(null), [showBalance, setShowBalance] = useState(false);
  const requests = useBackend(status === "available" ? "/rider/deliveries/requested?limit=20&offset=0" : null, 15000);
  let name = "", profileError = profile.error, list: ReturnType<typeof rows> = [], listError = requests.error;
  try { if (profile.data) name = profileName(normalizeProfile(profile.data)); } catch (cause) { profileError = cause instanceof Error ? cause.message : "Could not read profile."; }
  try { if (requests.data) list = rows(requests.data); } catch (cause) { listError = cause instanceof Error ? cause.message : "Could not read requests."; }
  return <RiderShell><div><p className={styles.muted}>{new Date().toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "full" })}</p><h1>{name ? `Hello, ${name}!` : "Rider dashboard"}</h1></div><Message error={profileError} />
    <div className={styles.grid}><section className={styles.card}><h2>Wallet balance</h2><p className={styles.metric}>{wallet.loading ? "Loading…" : wallet.error ? "Unavailable" : showBalance ? money(amount(wallet.data)) : "••••"}</p><Message error={wallet.error} /><div className={styles.actions}><button onClick={() => setShowBalance(value => !value)}>{showBalance ? "Hide balance" : "Show balance"}</button><Link className={styles.link} href="/rider/wallet">Open wallet</Link></div></section><RiderAvailability onStatus={setStatus} /></div>
    <section className={styles.card}><h2>Delivery requests</h2>{status !== "available" ? <p>{status === "offline" ? "Go online to receive delivery requests." : status === "busy" ? "Finish your current delivery before taking another request." : "Check your availability to view requests."}</p> : requests.loading ? <p>Loading requests…</p> : listError ? <Message error={listError} /> : list.length ? list.map(item => { const id = extractDeliveryId(item); return id ? <article className={styles.message} key={id}><p><strong>Pickup:</strong> {text(item.pickup_address, "Address unavailable")}</p><p><strong>Destination:</strong> {text(item.dropoff_address, "Address unavailable")}</p><Link className={styles.link} href={`/delivery/request?id=${encodeURIComponent(id)}`}>View request</Link></article> : null; }) : <p>No pending requests.</p>}<Link href="/rider/deliveries">View all your deliveries</Link></section>
    <section className={styles.card}><h2>Your account</h2><div className={styles.actions}><Link className={styles.link} href="/rider">Profile & vehicle details</Link><Link className={styles.link} href="/rider/earnings">Delivery earnings</Link><Link className={styles.link} href="/user/notification">Notifications{typeof unwrap(unread.data).unread_count === "number" ? ` (${unwrap(unread.data).unread_count})` : ""}</Link><Link className={styles.link} href="/rider/messages">Messages & support</Link></div></section>
  </RiderShell>;
}
