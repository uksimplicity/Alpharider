"use client";
import Link from "next/link";
import MobilityShell from "./MobilityShell";
import { Message, riderStyles as styles } from "./RiderShell";
import { useBackend, useStoredQuery } from "@/lib/hooks/use-backend";
import { date, money, record, text, unwrap } from "@/lib/backend-data";
export default function CustomerDelivery({ calling = false }: { calling?: boolean }) {
  const id = useStoredQuery("id", "alpharider_active_delivery_id");
  const resource = useBackend(id ? `/rider-app/deliveries/${encodeURIComponent(id)}` : null, 15000), root = unwrap(resource.data), data = record(root.delivery ?? root), rider = record(data.rider ?? data.driver), phone = text(rider.phone ?? data.rider_phone ?? data.driver_phone);
  return <MobilityShell><div className={styles.main}><h1>{calling ? "Contact your rider" : "Delivery details"}</h1>{!id ? <p>Select a delivery from your history.</p> : resource.loading ? <p>Loading delivery…</p> : resource.error ? <Message error={resource.error} /> : <section className={styles.card}><p>{text(data.reference ?? data.id, id)} · {text(data.status, "Status unavailable")}</p><p>{text(data.pickup_address)} → {text(data.dropoff_address)}</p><p>{date(data.created_at)}</p><p>Delivery fee: {money(data.delivery_fee ?? data.fee ?? data.amount)}</p><h2>Assigned rider</h2><p>{text(rider.name ?? data.rider_name ?? data.driver_name, "No rider details returned yet.")}</p>{/^\+?[\d\s()-]{7,}$/.test(phone) ? <a className={styles.link} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>Call rider</a> : <p>A contact number is not available yet.</p>}<div className={styles.actions}><Link className={styles.link} href={`/user/in-app-chat?id=${encodeURIComponent(id)}`}>Message rider</Link><button onClick={resource.refresh}>Refresh delivery</button></div></section>}<Link href="/user/delivery">Delivery history</Link></div></MobilityShell>;
}
