"use client";

import { useState } from "react";
import { deliveryContacts } from "@/lib/delivery-contacts";
import type { Row } from "@/lib/backend-data";
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
    <span className={name ? styles.contactName : styles.unavailable}>{name || "Name not provided"}</span>
    {phone ? <div className={styles.phoneRow}>
      {callable ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <span>{phone}</span>}
      <button type="button" className={styles.copy} aria-label={`Copy ${label.toLowerCase()} phone number`} title="Copy phone number" onClick={() => void copy()}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></svg>
      </button>
    </div> : <span className={styles.unavailable}>Phone not provided</span>}
    <span className={styles.copyFeedback} role="status">{feedback}</span>
  </div>;
}

export default function DeliveryContacts({ delivery }: { delivery: Row }) {
  const contacts = deliveryContacts(delivery);
  return <div className={styles.contacts}><Contact {...contacts.pickup} /><Contact {...contacts.dropoff} /></div>;
}
