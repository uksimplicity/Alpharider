"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadRiderInbox } from "@/lib/rider-inbox";
import { riderJob } from "@/lib/rider-job";
import { type Availability, type Row } from "@/lib/backend-data";
import { Message, riderStyles as styles } from "./RiderShell";
import DeliveryRequestCard from "./DeliveryRequestCard";
import inboxStyles from "./delivery-request.module.css";

export default function RiderInbox({ status }: { status: Availability | null }) {
  const [source, setSource] = useState(""), [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ jobs: Row[]; error: string; loading: boolean }>({ jobs: [], error: "", loading: true });
  const canViewRequests = status === "available" || status === "busy";
  useEffect(() => {
    if (!canViewRequests) return;
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
  }, [canViewRequests, attempt]);
  const jobs = result.jobs.filter(item => { const job = riderJob(item); return !job.expired && !job.future && (!source || job.source === source); });
  return <section className={styles.card}>
    <div className={inboxStyles.heading}><h2>Job requests</h2>{canViewRequests && !result.loading && !result.error ? <span className={inboxStyles.count}>{jobs.length}</span> : null}</div>
    <p className={inboxStyles.intro}>Find your next delivery. Check the route, amount and contacts before accepting.</p>
    <div className={inboxStyles.toolbar}><label>Source <select value={source} onChange={event => setSource(event.target.value)}><option value="">All sources</option><option value="marketplace">Marketplace</option><option value="alpharide">AlphaRide</option></select></label><button type="button" onClick={() => setAttempt(value => value + 1)}>Refresh requests</button></div>
    {!canViewRequests ? <p>{status === "offline" ? "Go online to receive job requests." : "Check your availability to view requests."}</p> : result.loading ? <p role="status">Loading requests…</p> : result.error ? <Message error={result.error} /> : jobs.length ? <div className={inboxStyles.list}>{jobs.map(item => <DeliveryRequestCard key={String(item.id)} item={item} />)}</div> : <p>No pending requests.</p>}
    <div className={styles.actions}><Link href="/rider/deliveries">View your jobs</Link><Link href="/rider/deliveries?scheduled=true">Scheduled pickups</Link></div>
  </section>;
}
