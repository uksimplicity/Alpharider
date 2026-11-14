"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadRiderInbox } from "@/lib/rider-inbox";
import { riderJob } from "@/lib/rider-job";
import { date, money, text, type Availability, type Row } from "@/lib/backend-data";
import { Message, riderStyles as styles } from "./RiderShell";

export default function RiderInbox({ status }: { status: Availability | null }) {
  const [source, setSource] = useState(""), [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ jobs: Row[]; error: string; loading: boolean }>({ jobs: [], error: "", loading: true });
  useEffect(() => {
    if (status !== "available") return;
    let active = true, pending = false;
    const load = async () => {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try { const jobs = await loadRiderInbox(); if (active) setResult({ jobs, error: "", loading: false }); }
      catch (cause) { if (active) setResult({ jobs: [], error: cause instanceof Error ? cause.message : "Could not load job requests.", loading: false }); }
      finally { pending = false; }
    };
    void load();
    const timer = setInterval(() => void load(), 20000);
    window.addEventListener("focus", load); document.addEventListener("visibilitychange", load);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", load); document.removeEventListener("visibilitychange", load); };
  }, [status, attempt]);
  const jobs = result.jobs.filter(item => { const job = riderJob(item); return !job.expired && !job.future && (!source || job.source === source); });
  return <section className={styles.card}><h2>Job requests</h2><div className={styles.actions}><label>Source <select value={source} onChange={event => setSource(event.target.value)}><option value="">All sources</option><option value="marketplace">Marketplace</option><option value="alpharide">AlphaRide</option></select></label><button onClick={() => setAttempt(value => value + 1)}>Refresh requests</button></div>
    {status !== "available" ? <p>{status === "offline" ? "Go online to receive job requests." : status === "busy" ? "Finish your current job before taking another request." : "Check your availability to view requests."}</p> : result.loading ? <p>Loading requests…</p> : result.error ? <Message error={result.error} /> : jobs.length ? jobs.map(item => {
      const job = riderJob(item), id = text(item.id);
      return <article className={styles.message} key={id}><span className={styles.badge}>{job.sourceLabel} · {job.kindLabel}</span>{job.status === "assigned" ? <p>Assigned invitation — your acceptance is required.</p> : null}<p><strong>Pickup:</strong> {text(item.pickup_address, "Address unavailable")}</p><p><strong>Destination:</strong> {text(item.dropoff_address, "Address unavailable")}</p><p>Fee: {money(item.delivery_fee ?? item.fee ?? item.amount)}</p>{job.expiresAt ? <p>Request expires: {date(job.expiresAt ? new Date(job.expiresAt).toISOString() : "")}</p> : null}<Link className={styles.link} href={`/delivery/request?id=${encodeURIComponent(id)}`}>Review request</Link></article>;
    }) : <p>No pending requests.</p>}<div className={styles.actions}><Link href="/rider/deliveries">View your jobs</Link><Link href="/rider/deliveries?scheduled=true">Scheduled pickups</Link></div></section>;
}
