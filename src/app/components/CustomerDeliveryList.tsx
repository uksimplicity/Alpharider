"use client";
import Link from "next/link";
import { date } from "@/lib/backend-data";
import { customerDeliveryGroup } from "@/lib/customer-deliveries";
import { formatDeliveryStatusLabel, getDeliveryStatusTone } from "@/lib/delivery-status";
import { useCustomerDeliveries } from "@/lib/hooks/use-customer-deliveries";

export default function CustomerDeliveryList({ activeOnly = false }: { activeOnly?: boolean }) {
  const result = useCustomerDeliveries();
  const all = result.data || [];
  const groups = activeOnly ? ["active"] : ["active", "history", "unknown"];
  return <section aria-label={activeOnly ? "Active deliveries" : "Your deliveries"}>
    <div className="mobility-title-row"><h2>{activeOnly ? "Your active deliveries" : "Your deliveries"}</h2><button className="mobility-button secondary" onClick={result.refresh}>Refresh deliveries</button></div>
    {result.loading ? <p role="status">Loading deliveries…</p> : result.error ? <div className="mobility-error" role="alert"><p>We couldn’t load your deliveries.</p><details><summary>Error details</summary><p>{result.error}</p>{result.status ? <p>HTTP status: {result.status}</p> : null}</details></div> : groups.map(group => {
      const list = all.filter(item => customerDeliveryGroup(item.status) === group);
      if (!list.length) return group === "active" ? <p key={group}>No active deliveries.</p> : null;
      return <div key={group}>{!activeOnly ? <h3>{group === "active" ? "Active" : group === "history" ? "History" : "Status not reported"}</h3> : null}<div className="mobility-ride-list">{list.map(item => <Link className="mobility-panel mobility-ride-card" key={item.id} href={`/user/delivery-details?id=${encodeURIComponent(item.id)}`}>
        <span className={`status-pill ${getDeliveryStatusTone(item.status)}`}>{formatDeliveryStatusLabel(item.status)}</span><h3>{item.reference}</h3>
        <div className="mobility-route"><div><small>Pickup</small><p>{item.pickup}</p></div><div><small>Destination</small><p>{item.destination}</p></div></div><p className="mobility-muted">Updated: {date(item.updated)}</p><span className="mobility-text-button">Track delivery →</span>
      </Link>)}</div></div>;
    })}
    {result.checked ? <p className="mobility-muted">Last checked: {date(result.checked)}. Updates while this page is visible.</p> : null}
    {activeOnly ? <Link className="mobility-text-button" href="/user/delivery">View all deliveries →</Link> : null}
  </section>;
}
