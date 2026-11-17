"use client";
import Link from "next/link";
import { useState } from "react";
import RiderShell, { Message, Pager, riderStyles as styles } from "@/app/components/RiderShell";
import { useBackend, useStoredQuery } from "@/lib/hooks/use-backend";
import { rows, text, date } from "@/lib/backend-data";
import { riderJob } from "@/lib/rider-job";
import DeliveryContacts from "@/app/components/DeliveryContacts";

export default function RiderDeliveriesPage() {
  const scheduled = useStoredQuery("scheduled");
  const [status, setStatus] = useState(""), [offset, setOffset] = useState(0), [source, setSource] = useState(""), [pickup, setPickup] = useState<string | null>(null);
  const pickupFilter = pickup ?? (scheduled === "true" ? "scheduled" : "");
  const resource = useBackend(`/rider/deliveries?limit=20&offset=${offset}${status ? `&status=${status}` : ""}`, 30000);
  let list: ReturnType<typeof rows> = [], error = resource.error;
  try { if (resource.data) list = rows(resource.data); } catch (cause) { error = cause instanceof Error ? cause.message : "Could not read jobs."; }
  const visible = list.filter(item => { const job = riderJob(item); return (!source || job.source === source) && (!pickupFilter || (job.future && !job.terminal)); });
  return <RiderShell><h1>My jobs</h1>
    <div className={styles.actions}>
      <label>Status <select value={status} onChange={event => { setStatus(event.target.value); setOffset(0); }}><option value="">All</option>{["requested", "assigned", "picking_up", "on_the_way", "delivered", "completed", "cancelled", "expired"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Source on this page <select value={source} onChange={event => setSource(event.target.value)}><option value="">All sources</option><option value="marketplace">Marketplace</option><option value="alpharide">AlphaRide</option></select></label>
      <label>Pickup time on this page <select value={pickupFilter} onChange={event => setPickup(event.target.value)}><option value="">All pickups</option><option value="scheduled">Upcoming scheduled pickups</option></select></label>
      <button onClick={resource.refresh}>Refresh</button>
    </div>
    <Message error={error} /><section className={styles.card}>{resource.loading ? <p>Loading jobs…</p> : visible.length ? visible.map(item => {
      const job = riderJob(item), id = text(item.id ?? item.delivery_id);
      return <article className={styles.message} key={id}><span className={styles.badge}>{job.sourceLabel} · {job.kindLabel} · {job.status}</span>{job.scheduledFor ? <p>Scheduled pickup: {date(new Date(job.scheduledFor).toISOString())}</p> : null}<p>{text(item.pickup_address)} → {text(item.dropoff_address)}</p><p>{date(item.created_at)}</p><DeliveryContacts delivery={item} /><div className={styles.actions}><Link className={styles.link} href={`/delivery/request?id=${encodeURIComponent(id)}`}>View job</Link>{job.status !== "requested" ? <Link className={styles.link} href={`/delivery/chat?id=${encodeURIComponent(id)}`}>Message customer</Link> : null}</div></article>;
    }) : !error ? <p>{list.length ? "No jobs on this page match your filters." : "No jobs found."}</p> : null}<Pager offset={offset} count={list.length} onPage={setOffset} /></section>
  </RiderShell>;
}
