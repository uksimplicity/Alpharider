"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MobilityShell from "@/app/components/MobilityShell";
import { getRide, scheduledTime, type Ride } from "@/lib/booking-api";
import { formatDeliveryStatusLabel, getDeliveryStatusTone, isCompletedDeliveryStatus } from "@/lib/delivery-status";

export default function RideDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updated, setUpdated] = useState("");
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    if (inFlight.current) return;
    const token = localStorage.getItem("alpharider_token");
    if (!token) return;
    inFlight.current = true;
    setError("");
    try { setRide(await getRide(token, id)); setUpdated(new Date().toLocaleTimeString()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load this trip."); }
    finally { setLoading(false); inFlight.current = false; }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  const terminal = ride ? isCompletedDeliveryStatus(ride.status) : false;
  useEffect(() => {
    if (!ride || terminal) return;
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 30000);
    return () => window.clearInterval(interval);
  }, [load, terminal, ride]);
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "My AlphaRide trip", url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setMessage("Trip link copied. The recipient must have permission to view this trip."); }
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setMessage("Sharing is unavailable. Copy the address from your browser."); }
  };
  const scheduled = ride ? scheduledTime(ride) : null;
  const phone = ride?.rider_phone?.replace(/[^+\d]/g, "");
  return <MobilityShell>
    <Link className="mobility-back" href="/user/rides">← Your rides</Link>
    <div className="mobility-title-row"><h1>Trip details</h1><button className="mobility-button secondary" onClick={load} disabled={loading}>Refresh</button></div>
    {error && <p className="mobility-error" role="alert">{error}{ride ? " Showing the last loaded trip details." : ""}</p>}
    {loading ? <p role="status">Loading trip…</p> : ride ? <div className="mobility-two-col">
      <section className="mobility-panel"><span className={`status-pill ${getDeliveryStatusTone(ride.status)}`}>{formatDeliveryStatusLabel(ride.status)}</span><h2>{terminal ? "Journey summary" : scheduled ? "Your scheduled request" : "Your journey"}</h2><div className="mobility-route"><div><small>Pickup</small><p>{ride.pickup_address || "Pickup unavailable"}</p></div><div><small>Destination</small><p>{ride.dropoff_address || "Destination unavailable"}</p></div></div><dl className="mobility-facts"><div><dt>Reference</dt><dd>{id}</dd></div>{scheduled && <div><dt>Requested pickup</dt><dd>{new Date(scheduled).toLocaleString()}</dd></div>}<div><dt>Last checked</dt><dd>{updated}</dd></div></dl><p className="mobility-muted">{terminal ? "This trip has ended." : "Status refreshes every 30 seconds while this page is visible."}</p><button className="mobility-button secondary" onClick={share}>Share trip link</button>{message && <p role="status">{message}</p>}</section>
      <section className="mobility-panel"><h2>Your driver</h2><p>{ride.rider_name || "Driver details will appear once assigned."}</p>{phone && <a className="mobility-button" href={`tel:${phone}`}>Call driver</a>}<hr /><h2>Fare & payment</h2><p className="mobility-muted">Confirm the fare and payment arrangements with your driver. This page does not process payments.</p><h2>Need help?</h2><p className="mobility-muted">Contact support for changes or cancellation.</p><a className="mobility-button secondary" href="mailto:info@alphariderapp.com">Contact support</a></section>
    </div> : <section className="mobility-panel"><h2>Trip unavailable</h2><p>Try refreshing or choose a trip from Your rides.</p></section>}
  </MobilityShell>;
}
