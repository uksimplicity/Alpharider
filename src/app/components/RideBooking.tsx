"use client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobilityShell, { MobilityIcon } from "./MobilityShell";
import { createRide, emptyRideDraft, RIDE_OPTIONS, type RideDraft, validateRideDraft } from "@/lib/booking-api";
import { extractDeliveryId } from "@/lib/deliveries-api";

export default function RideBooking({ scheduled = false }: { scheduled?: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<RideDraft>(emptyRideDraft);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const submitting = useRef(false);
  const draftKey = scheduled ? "alpharider_schedule_draft" : "alpharider_ride_draft";
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
      if (saved && typeof saved === "object") {
        const restored = { ...emptyRideDraft };
        for (const key of Object.keys(restored) as (keyof RideDraft)[]) {
          if (typeof saved[key] === "string") restored[key] = saved[key];
        }
        setDraft(restored);
      }
    } catch { /* A damaged draft can be safely replaced. */ }
  }, [draftKey]);
  const change = (values: Partial<RideDraft>) => {
    setDraft(current => {
      const next = { ...current, ...values };
      sessionStorage.setItem(draftKey, JSON.stringify(next));
      return next;
    });
    setError("");
  };
  const locate = () => {
    if (!navigator.geolocation) { setError("Location is unavailable in this browser. Enter your pickup coordinates below."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(position => {
      change({ pickupLat: String(position.coords.latitude), pickupLng: String(position.coords.longitude) });
      setLocating(false);
    }, () => { setError("We couldn’t get your location. Allow location access or enter your pickup coordinates."); setLocating(false); }, { timeout: 10000, maximumAge: 60000 });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const problem = validateRideDraft(draft) || (scheduled && !draft.scheduledFor ? "Choose a pickup date and time." : "");
    if (problem) { setError(problem); return; }
    if (!review) { setReview(true); setError(""); return; }
    const token = localStorage.getItem("alpharider_token");
    if (!token) { router.replace("/auth/login"); return; }
    submitting.current = true;
    setBusy(true); setError("");
    try {
      const ride = await createRide(token, draft);
      sessionStorage.removeItem(draftKey);
      router.replace(`/user/rides/${encodeURIComponent(extractDeliveryId(ride))}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request your ride. Please try again.");
    } finally { setBusy(false); submitting.current = false; }
  };
  return <MobilityShell>
    <Link className="mobility-back" href="/user/dashboard">← Back home</Link>
    <div className="mobility-title-row"><div><p className="mobility-eyebrow">{scheduled ? "PLAN AHEAD" : "LET’S GET YOU THERE"}</p><h1>{review ? "Review your ride" : scheduled ? "Schedule a ride" : "Where to?"}</h1></div><MobilityIcon name={scheduled ? "calendar" : "car"} /></div>
    <form onSubmit={submit} className="mobility-booking">
      {review ? <section className="mobility-panel">
        <h2>Your journey</h2><div className="mobility-route"><div><small>Pickup</small><p>{draft.pickup}</p></div><div><small>Destination</small><p>{draft.dropoff}</p></div></div>
        <dl className="mobility-facts"><div><dt>Ride</dt><dd>{draft.rideType}</dd></div><div><dt>Pickup time</dt><dd>{draft.scheduledFor ? new Date(draft.scheduledFor).toLocaleString() : "Now"}</dd></div><div><dt>Fare</dt><dd>To be confirmed</dd></div>{draft.note && <div><dt>Driver note</dt><dd>{draft.note}</dd></div>}</dl>
        <p className="mobility-notice">{scheduled ? "Your preferred pickup time will be included with your request. Driver availability and the fare still need to be confirmed." : "The driver and fare still need to be confirmed. Submitting this request does not charge you."}</p>
        <button className="mobility-button secondary" type="button" disabled={busy} onClick={() => setReview(false)}>Edit journey</button>
      </section> : <>
        <section className="mobility-panel"><h2>Your route</h2>
          <label className="mobility-field">Pickup address<input autoComplete="street-address" required maxLength={300} value={draft.pickup} onChange={e => change({ pickup: e.target.value })} placeholder="Where should we meet you?" /></label>
          <button type="button" className="mobility-text-button" onClick={() => change({ pickup: draft.dropoff, dropoff: draft.pickup, pickupLat: draft.dropoffLat, pickupLng: draft.dropoffLng, dropoffLat: draft.pickupLat, dropoffLng: draft.pickupLng })}>⇅ Swap locations</button>
          <label className="mobility-field">Destination address<input required maxLength={300} value={draft.dropoff} onChange={e => change({ dropoff: e.target.value })} placeholder="Where are you going?" /></label>
          <div className="mobility-notice">Address search and map pins are not available yet. Enter coordinates from your map app to identify the exact pickup and destination.</div>
          <button className="mobility-button secondary" type="button" onClick={locate} disabled={locating}>{locating ? "Finding your location…" : "Use my location for pickup"}</button>
          <div className="mobility-coordinate-grid">{[
            { key: "pickupLat" as const, label: "Pickup latitude", max: 90 },
            { key: "pickupLng" as const, label: "Pickup longitude", max: 180 },
            { key: "dropoffLat" as const, label: "Destination latitude", max: 90 },
            { key: "dropoffLng" as const, label: "Destination longitude", max: 180 },
          ].map(field => <label className="mobility-field" key={field.key}>{field.label}<input type="number" inputMode="decimal" step="any" required min={-field.max} max={field.max} value={draft[field.key]} onChange={e => change({ [field.key]: e.target.value })} /></label>)}</div>
          {scheduled && <label className="mobility-field">Pickup date and time<input required type="datetime-local" value={draft.scheduledFor} onChange={e => change({ scheduledFor: e.target.value })} /><small>Choose a time within the next 30 days, in your local timezone.</small></label>}
        </section>
        <section className="mobility-panel"><fieldset className="mobility-options"><legend>Choose your ride</legend>{RIDE_OPTIONS.map(option => <label className={`mobility-option ${draft.rideType === option.name ? "selected" : ""}`} key={option.name}><input type="radio" name="rideType" value={option.name} checked={draft.rideType === option.name} onChange={() => change({ rideType: option.name })} /><MobilityIcon name="car" /><span><strong>{option.name}</strong><small>{option.description} · {option.seats} seats</small></span></label>)}</fieldset>
          <label className="mobility-field">Note for the driver <small>(optional)</small><textarea rows={3} maxLength={500} value={draft.note} onChange={e => change({ note: e.target.value })} placeholder="A landmark or pickup instructions" /></label>
          <p className="mobility-muted">Fare and driver availability will be confirmed separately.</p>
        </section>
      </>}
      <div className="mobility-submit">{error && <p className="mobility-error" role="alert">{error}</p>}<button className="mobility-button" disabled={busy || locating} type="submit">{busy ? "Sending request…" : review ? (scheduled ? "Send scheduled ride request" : "Request ride") : "Review ride"}<MobilityIcon name="arrow" /></button></div>
    </form>
  </MobilityShell>;
}
