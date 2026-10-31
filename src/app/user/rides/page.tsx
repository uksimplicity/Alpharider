"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MobilityShell from "@/app/components/MobilityShell";
import { getRides, type Ride, scheduledTime } from "@/lib/booking-api";
import { extractDeliveryId } from "@/lib/deliveries-api";
import { formatDeliveryStatusLabel, getDeliveryStatusTone, isCompletedDeliveryStatus } from "@/lib/delivery-status";

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"active" | "history">("active");
  const load = useCallback(async () => {
    const token = localStorage.getItem("alpharider_token");
    if (!token) return;
    setLoading(true); setError("");
    try { setRides(await getRides(token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load your rides."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = rides.filter(ride => isCompletedDeliveryStatus(ride.status) === (tab === "history"));
  return <MobilityShell>
    <div className="mobility-title-row"><div><p className="mobility-eyebrow">EVERY JOURNEY, IN ONE PLACE</p><h1>Your rides</h1><p className="mobility-muted">Check your next trip or look back on past journeys.</p></div><button className="mobility-button secondary" onClick={load} disabled={loading}>Refresh</button></div>
    <div className="mobility-tabs" aria-label="Filter rides">{(["active", "history"] as const).map(value => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)}>{value === "active" ? "Active & scheduled" : "History"}</button>)}</div>
    {loading ? <p role="status" className="mobility-panel">Loading your rides…</p> : error ? <div className="mobility-error" role="alert"><p>{error}</p><button className="mobility-button secondary" onClick={load}>Try again</button></div> : visible.length === 0 ? <section className="mobility-panel mobility-empty"><h2>{tab === "active" ? "Ready when you are." : "A fresh start."}</h2><p>{tab === "active" ? "No active trips right now. Where will your next ride take you?" : "Your completed and cancelled rides will appear here."}</p><Link className="mobility-button" href="/user/book-ride">Find a ride</Link></section> : <div className="mobility-ride-list">{visible.map(ride => {
      const id = extractDeliveryId(ride); const time = scheduledTime(ride);
      return <Link className="mobility-panel mobility-ride-card" key={id} href={`/user/rides/${encodeURIComponent(id)}`}><div className="mobility-title-row"><strong>{time ? "Scheduled request" : "Ride"}</strong><span className={`status-pill ${getDeliveryStatusTone(ride.status)}`}>{formatDeliveryStatusLabel(ride.status)}</span></div><div className="mobility-route"><div><small>Pickup</small><p>{ride.pickup_address || "Pickup unavailable"}</p></div><div><small>Destination</small><p>{ride.dropoff_address || "Destination unavailable"}</p></div></div><p className="mobility-muted">{time ? `Requested pickup: ${new Date(time).toLocaleString()}` : ride.created_at && Number.isFinite(Date.parse(ride.created_at)) ? new Date(ride.created_at).toLocaleString() : "Date unavailable"}</p><span className="mobility-text-button">View trip →</span></Link>;
    })}</div>}
  </MobilityShell>;
}
