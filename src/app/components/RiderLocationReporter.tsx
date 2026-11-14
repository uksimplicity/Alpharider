"use client";
import { useEffect, useState } from "react";
import { accountRequest, checkSession, currentToken } from "@/lib/account-client";
import { record, unwrap } from "@/lib/backend-data";
import { getRiderAccess } from "@/lib/rider-access";
import { deviceLocation, hasDeviceLocationPermission } from "@/lib/rider-location";
import { riderJob } from "@/lib/rider-job";
import { reconcileJob } from "@/lib/rider-job-actions";
import styles from "./rider.module.css";

export default function RiderLocationReporter({ activeDeliveryId }: { activeDeliveryId?: string }) {
  const [error, setError] = useState(""), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true, pending = false, generation = 0;
    const report = async () => {
      if (!alive || pending || document.visibilityState === "hidden") return;
      pending = true; const version = generation;
      try {
        const token = currentToken();
        const valid = () => { checkSession(token); if (!alive || generation !== version || document.visibilityState === "hidden") throw new Error("Location reporting paused."); };
        const access = await getRiderAccess(); valid();
        if (access.approval !== "approved" || (access.status !== "available" && access.status !== "busy")) { if (alive) setError(""); return; }
        if (!navigator.permissions && !hasDeviceLocationPermission()) { setError("Use Enable location sharing to allow automatic location updates while this page is open."); return; }
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: "geolocation" }); valid();
          if (permission.state !== "granted") { setError("Allow location access to keep your position updated while you are online."); return; }
        }
        const location = await deviceLocation(); valid();
        await accountRequest("/rider/location", { method: "POST", body: JSON.stringify(location) }); valid();
        if (activeDeliveryId) {
          const payload = unwrap(await accountRequest(`/rider/deliveries/${encodeURIComponent(activeDeliveryId)}`)); valid();
          const raw = record(payload.delivery ?? payload), job = riderJob(raw);
          const receipt = await reconcileJob(activeDeliveryId, raw); valid();
          if (!job.terminal && (!job.needsAcceptance || receipt.accepted) && ["assigned", "picking_up", "on_the_way"].includes(job.status)) {
            await accountRequest(`/rider/deliveries/${encodeURIComponent(activeDeliveryId)}/location`, { method: "POST", body: JSON.stringify(location) }); valid();
          }
        }
        setError("");
      } catch (cause) { if (alive && version === generation) setError(cause instanceof Error ? cause.message : "Your location could not be updated."); }
      finally { pending = false; }
    };
    const refresh = () => { generation++; if (document.visibilityState !== "hidden") void report(); };
    void report();
    const timer = setInterval(() => void report(), 30000);
    window.addEventListener("focus", refresh); window.addEventListener("storage", refresh); window.addEventListener("alpharider:availability", refresh); window.addEventListener("alpharider:session", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { alive = false; generation++; clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); window.removeEventListener("alpharider:availability", refresh); window.removeEventListener("alpharider:session", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [activeDeliveryId, attempt]);
  if (!error) return null;
  return <section className={styles.card} aria-label="Location sharing"><p role="status">{error}</p><button onClick={() => { void deviceLocation().then(() => setAttempt(value => value + 1)).catch(cause => setError(cause instanceof Error ? cause.message : "Location is unavailable.")); }}>Enable location sharing</button><p className={styles.muted}>Keep this page open while online. Location updates pause when the page is hidden.</p></section>;
}
