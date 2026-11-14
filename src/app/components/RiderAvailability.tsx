"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountRequest, checkSession, currentToken } from "@/lib/account-client";
import { availability, type Availability } from "@/lib/backend-data";
import { LocationAccessError, setAvailabilityFromDevice } from "@/lib/rider-location";
import { Message, riderStyles as styles } from "./RiderShell";

export default function RiderAvailability({ onStatus }: { onStatus?: (status: Availability | null) => void }) {
  const [status, setStatus] = useState<Availability | null>(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const lock = useRef(false), generation = useRef({ value: 0 });
  const load = useCallback(async () => {
    const version = ++generation.current.value;
    try { const result = availability(await accountRequest("/rider/profile")); if (version === generation.current.value) { setStatus(result); onStatus?.(result); setError(result ? "" : "Availability was not returned. Choose Online or Offline to set it."); } }
    catch (cause) { if (version === generation.current.value) { setStatus(null); onStatus?.(null); setError(cause instanceof Error ? cause.message : "Could not load availability."); } }
    finally { if (version === generation.current.value) setLoading(false); }
  }, [onStatus]);
  useEffect(() => { const guard = generation.current; let active = true; void load(); const focus = () => { if (active && !lock.current) void load(); }; window.addEventListener("focus", focus); return () => { active = false; guard.value++; window.removeEventListener("focus", focus); }; }, [load]);
  const update = async (next: Availability) => {
    if (lock.current) return; lock.current = true; generation.current.value++; setBusy(true); setError("");
    try {
      const token = currentToken();
      await setAvailabilityFromDevice(next);
      checkSession(token); setStatus(next); onStatus?.(next);
      // A fresh read reconciles the server's persisted state without replaying the write.
      await load();
    } catch (cause) {
      if (!(cause instanceof LocationAccessError)) { setStatus(null); onStatus?.(null); }
      setError(`${cause instanceof Error ? cause.message : "Availability update failed."}${cause instanceof LocationAccessError ? "" : " Refresh your status before trying again."}`);
    }
    finally { lock.current = false; setBusy(false); }
  };
  return <section className={styles.card}><h2>Availability</h2><p role="status">{loading ? "Checking availability…" : status === "available" ? "Online — available for requests" : status === "busy" ? "Busy — completing a delivery" : status === "offline" ? "Offline" : "Status unavailable"}</p><Message error={error} /><div className={styles.actions}><button role="switch" aria-checked={status === "available" || status === "busy"} disabled={loading || busy || !status} onClick={() => void update(status === "offline" ? "available" : "offline")}>{busy ? "Updating…" : status === "offline" ? "Go online" : "Go offline"}</button>{!status && !loading ? <><button disabled={busy} onClick={() => void update("available")}>Set online</button><button disabled={busy} onClick={() => void update("offline")}>Set offline</button></> : null}<button disabled={busy} onClick={() => void load()}>Refresh status</button></div></section>;
}
