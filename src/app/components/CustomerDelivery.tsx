"use client";
import Link from "next/link";
import MobilityShell from "./MobilityShell";
import { useStoredQuery } from "@/lib/hooks/use-backend";
import { useCustomerDelivery } from "@/lib/hooks/use-customer-deliveries";
import { date, money, record, text } from "@/lib/backend-data";
import { formatDeliveryStatusLabel, getDeliveryStatusTone } from "@/lib/delivery-status";

export default function CustomerDelivery({ calling = false }: { calling?: boolean }) {
  // Customer routes use an explicit reference, never a rider account's active-job key.
  const id = useStoredQuery("id");
  const resource = useCustomerDelivery(id), delivery = resource.data;
  const phone = delivery?.riderPhone || "";
  const assigned = Boolean(delivery?.riderId || delivery?.riderName || phone);
  return <MobilityShell><Link className="mobility-back" href="/user/delivery">← Your deliveries</Link>
    <p className="mobility-eyebrow">ALPHA SEND</p><div className="mobility-title-row"><h1>{calling ? "Contact your rider" : "Track your delivery"}</h1>{id ? <button className="mobility-button secondary" onClick={resource.refresh}>Refresh delivery</button> : null}</div>
    {!id ? <section className="mobility-panel"><p>Select a delivery from Your deliveries.</p></section> : resource.loading ? <p role="status">Loading delivery…</p> : resource.error ? <section className="mobility-error" role="alert"><p>We couldn’t open this delivery. Refresh or return to Your deliveries.</p><details><summary>Error details</summary><p>Delivery ID: {id}</p>{resource.status ? <p>HTTP status: {resource.status}</p> : null}<p>{resource.error}</p></details></section> : delivery ? <div className="mobility-two-col">
      <section className="mobility-panel"><span className={`status-pill ${getDeliveryStatusTone(delivery.status)}`}>{formatDeliveryStatusLabel(delivery.status)}</span><h2 className="mobility-delivery-reference">{delivery.reference}</h2>
        <div className="mobility-route"><div><small>Pickup</small><p>{delivery.pickup}</p></div><div><small>Destination</small><p>{delivery.destination}</p></div></div>
        <dl className="mobility-facts"><div><dt>Delivery ID</dt><dd>{delivery.id}</dd></div><div><dt>Updated</dt><dd>{date(delivery.updated)}</dd></div><div><dt>Delivery fee</dt><dd>{money(delivery.fee)}</dd></div><div><dt>Payment status</dt><dd>{delivery.paymentStatus || "Not reported"}</dd></div></dl>
        {Array.isArray(delivery.items) && delivery.items.length ? <><h3>Package details</h3><ul>{delivery.items.map((item, index) => { const row = record(item); return <li key={index}>{text(row.name, "Package")} · Quantity: {text(row.quantity, "Not reported")}</li>; })}</ul></> : null}
        <p className="mobility-muted">Last checked: {date(resource.checked)}. Status refreshes while this page is visible.</p>
      </section>
      <section className="mobility-panel"><h2>Your rider</h2><p>{delivery.riderName || (assigned ? "Rider assigned. Name not reported yet." : "Awaiting rider assignment.")}</p>
        {/^\+?[\d\s()-]{7,}$/.test(phone) ? <a className="mobility-button" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>Call rider</a> : <p className="mobility-muted">Rider contact details have not been reported yet.</p>}
        {assigned ? <p><Link className="mobility-button secondary" href={`/user/in-app-chat?id=${encodeURIComponent(id)}`}>Message rider</Link></p> : <p className="mobility-muted">Delivery chat becomes available once a rider is assigned.</p>}
        <hr /><h3>Need help?</h3><Link className="mobility-text-button" href="/user/in-app-chat">Messages & support →</Link>
      </section>
    </div> : null}
  </MobilityShell>;
}
