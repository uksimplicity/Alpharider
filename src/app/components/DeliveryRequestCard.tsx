"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { date, money, profileName, record, text, type Row } from "@/lib/backend-data";
import { riderJob } from "@/lib/rider-job";
import styles from "./delivery-request.module.css";
import { performJobAction } from "@/lib/rider-job-actions";
import RequestDecisionButtons from "./RequestDecisionButtons";

function Contact({ label, name, phone }: { label: string; name: string; phone: string }) {
  const [feedback, setFeedback] = useState("");
  const callable = /^\+?[\d\s()-]{7,}$/.test(phone);
  async function copy() {
    try {
      await navigator.clipboard.writeText(phone);
      setFeedback("Phone number copied");
    } catch {
      setFeedback("Could not copy. Select and copy the number manually.");
    }
  }
  return <div className={styles.contact}>
    <span className={styles.label}>{label}</span>
    {name ? <span className={styles.contactName}>{name}</span> : null}
    {phone ? <div className={styles.phoneRow}>
      {callable ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <span>{phone}</span>}
      <button type="button" className={styles.copy} aria-label={`Copy ${label.toLowerCase()} phone number`} title="Copy phone number" onClick={() => void copy()}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></svg>
      </button>
    </div> : <span className={styles.unavailable}>Phone not provided</span>}
    <span className={styles.copyFeedback} role="status">{feedback}</span>
  </div>;
}

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
  const customer = record(item.customer ?? item.user), receiver = record(item.receiver ?? item.recipient);
  const pickupPhone = text(item.pickup_contact) || text(item.pickup_phone) || text(item.sender_phone) || text(customer.phone) || text(customer.phone_number);
  const dropoffPhone = text(item.dropoff_contact) || text(item.receiver_phone) || text(item.recipient_phone) || text(receiver.phone) || text(receiver.phone_number);
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
    <div className={styles.contacts}>
      <Contact label="Pickup contact" name={text(item.pickup_contact_name) || text(item.sender_name) || profileName(customer) || text(item.customer_name)} phone={pickupPhone} />
      <Contact label="Drop-off contact" name={text(item.receiver_name) || text(item.recipient_name) || profileName(receiver)} phone={dropoffPhone} />
    </div>
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
