"use client";

import { useEffect, useState } from "react";
import { deliveryContacts, deliveryContactsVisible } from "@/lib/delivery-contacts";
import { text, type Row } from "@/lib/backend-data";
import { reconcileJob } from "@/lib/rider-job-actions";
import styles from "./delivery-request.module.css";

function Contact({ label, name, phone }: { label: string; name: string; phone: string }) {
  const [feedback, setFeedback] = useState("");
  const callable = /^\+?[\d\s()-]{7,}$/.test(phone);
  async function copy() {
    try { await navigator.clipboard.writeText(phone); setFeedback("Phone number copied"); }
    catch { setFeedback("Could not copy. Select and copy the number manually."); }
  }
  return <div className={styles.contact}>
    <span className={styles.label}>{label}</span>
    <span className={name ? styles.contactName : styles.unavailable}>{name.trim().split(/\s+/)[0] || "Name not provided"}</span>
    {phone ? <div className={styles.phoneRow}>
      {callable ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <span>{phone}</span>}
      {callable ? <a className={styles.call} href={`tel:${phone.replace(/[^\d+]/g, "")}`} aria-label={`Call ${label.toLowerCase()} at ${phone}`} title={`Call ${phone}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" /></svg>
      </a> : null}
      <button type="button" className={styles.copy} aria-label={`Copy ${label.toLowerCase()} phone number`} title="Copy phone number" onClick={() => void copy()}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></svg>
      </button>
    </div> : <span className={styles.unavailable}>Phone not provided</span>}
    <span className={styles.copyFeedback} role="status">{feedback}</span>
  </div>;
}

export default function DeliveryContacts({ delivery, accepted = false }: { delivery: Row; accepted?: boolean }) {
  const [receipt, setReceipt] = useState<{ delivery: Row; accepted: boolean } | null>(null);
  const confirmed = deliveryContactsVisible(delivery, accepted);
  useEffect(() => {
    if (confirmed || text(delivery.status).toLowerCase() !== "assigned") return;
    const id = text(delivery.id ?? delivery.delivery_id);
    if (!id) return;
    let active = true;
    void reconcileJob(id, delivery).then(result => {
      if (active) setReceipt({ delivery, accepted: result.accepted === true });
    }).catch(() => { if (active) setReceipt(null); });
    return () => { active = false; };
  }, [delivery, confirmed]);
  if (!deliveryContactsVisible(delivery, confirmed || (receipt?.delivery === delivery && receipt.accepted))) return null;
  const contacts = deliveryContacts(delivery);
  return <div className={styles.contacts}><Contact {...contacts.pickup} /><Contact {...contacts.dropoff} /></div>;
}
