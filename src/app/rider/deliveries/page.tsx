"use client";
import Link from "next/link";
import { useState } from "react";
import RiderShell, { Message, Pager, riderStyles as styles } from "@/app/components/RiderShell";
import { useBackend } from "@/lib/hooks/use-backend";
import { rows, text, date } from "@/lib/backend-data";
export default function RiderDeliveriesPage() {
  const [status, setStatus] = useState(""), [offset, setOffset] = useState(0);
  const resource = useBackend(`/rider/deliveries?limit=20&offset=${offset}${status ? `&status=${status}` : ""}`, 30000);
  let list: ReturnType<typeof rows> = [], error = resource.error;
  try { if (resource.data) list = rows(resource.data); } catch (cause) { error = cause instanceof Error ? cause.message : "Could not read deliveries."; }
  return <RiderShell><h1>My deliveries</h1><div className={styles.actions}><label>Status <select value={status} onChange={event => { setStatus(event.target.value); setOffset(0); }}><option value="">All</option>{["requested", "assigned", "picking_up", "on_the_way", "delivered", "completed", "cancelled"].map(value => <option key={value}>{value}</option>)}</select></label><button onClick={resource.refresh}>Refresh</button></div><Message error={error} /><section className={styles.card}>{resource.loading ? <p>Loading deliveries…</p> : list.length ? list.map(item => <article className={styles.message} key={text(item.id)}><span className={styles.badge}>{text(item.status)}</span><p>{text(item.pickup_address)} → {text(item.dropoff_address)}</p><p>{date(item.created_at)}</p><Link href={`/delivery/request?id=${encodeURIComponent(text(item.id ?? item.delivery_id))}`}>View delivery</Link></article>) : !error ? <p>No deliveries found.</p> : null}<Pager offset={offset} count={list.length} onPage={setOffset} /></section></RiderShell>;
}
