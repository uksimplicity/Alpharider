"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { date, money, text, type Row } from "@/lib/backend-data";
import { riderJob } from "@/lib/rider-job";
import styles from "./delivery-request.module.css";
import { performJobAction } from "@/lib/rider-job-actions";
import RequestDecisionButtons from "./RequestDecisionButtons";
import DeliveryContacts from "./DeliveryContacts";

export default function DeliveryRequestCard({ item }: { item: Row }) {
  const job = riderJob(item), id = text(item.id);
  const router = useRouter(), lock = useRef(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function accept() {
    if (lock.current || job.expired || job.future || job.terminal || !job.needsAcceptance) return;
    if (!window.confirm(`Accept this ${job.kindLabel.toLowerCase()}?\nPickup: ${text(item.pickup_address)}\nDestination: ${text(item.dropoff_address)}\nAmount: ${money(item.delivery_fee ?? item.fee ?? item.amount)}`)) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await performJobAction(id, "accept");
      localStorage.setItem("alpharider_active_delivery_id", id);
      router.push(`/delivery/request?id=${encodeURIComponent(id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not confirm acceptance. Refresh requests before trying again.");
      lock.current = false; setBusy(false);
    }
  }
  const reference = text(item.delivery_number) || text(item.reference);
  const payment = text(item.payment_method).replace(/_/g, " ");
  return <article className={styles.request}>
    <div className={styles.top}>
      <div><div className={styles.badges}><span className={styles.source}>{job.sourceLabel}</span><span className={styles.kind}>{job.kindLabel}</span></div>
        {reference ? <p className={styles.reference}>{reference}</p> : null}
      </div>
      <div className={styles.amount}><span>Delivery amount</span><strong>{money(item.delivery_fee ?? item.fee ?? item.amount)}</strong></div>
    </div>
    {job.status === "assigned" ? <p className={styles.invitation}>Assigned to you · Review and accept to get started</p> : null}
    <div className={styles.route}>
      <div className={styles.stop}><span className={styles.pickupDot} aria-hidden="true" /><div><span className={styles.label}>Pickup</span><p>{text(item.pickup_address, "Address unavailable")}</p></div></div>
      <div className={styles.stop}><span className={styles.destinationDot} aria-hidden="true" /><div><span className={styles.label}>Destination</span><p>{text(item.dropoff_address, "Address unavailable")}</p></div></div>
    </div>
    <DeliveryContacts delivery={item} />
    <div className={styles.footer}>
      <div className={styles.details}>
        {payment ? <span>Payment: <strong>{payment}</strong></span> : null}
        {text(item.created_at) ? <span>Requested {date(item.created_at)}</span> : null}
        {job.expiresAt ? <span className={styles.expiry}>Expires {date(new Date(job.expiresAt).toISOString())}</span> : null}
        {!payment && !text(item.created_at) && !job.expiresAt ? <span>View full details before accepting</span> : null}
      </div>
      <div className={styles.requestActions}>
        <Link className={styles.review} href={`/delivery/request?id=${encodeURIComponent(id)}`}>Review request <span aria-hidden="true">→</span></Link>
        <RequestDecisionButtons busy={busy} disabled={!id || job.expired || job.future || job.terminal || !job.needsAcceptance} onAccept={() => void accept()} />
      </div>
    </div>
    {error ? <p className={styles.actionError} role="alert">{error}</p> : null}
  </article>;
}
