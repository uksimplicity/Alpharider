"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkSession, currentToken } from "@/lib/account-client";
import { type Availability } from "@/lib/backend-data";
import { getRiderAccess, riderApprovalMessage, type RiderAccess } from "@/lib/rider-access";
import { LocationAccessError, setAvailabilityFromDevice } from "@/lib/rider-location";
import { Message, riderStyles as styles } from "./RiderShell";

export default function RiderAvailability({ onStatus }: { onStatus?: (status: Availability | null) => void }) {
  const [access, setAccess] = useState<RiderAccess | null>(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const lock = useRef(false), generation = useRef({ value: 0 });
  const load = useCallback(async () => {
    const version = ++generation.current.value;
    try {
      const result = await getRiderAccess();
      if (version === generation.current.value) { setAccess(result); onStatus?.(result.approval === "approved" ? result.status : null); setError(""); }
    } catch (cause) {
      if (version === generation.current.value) { setAccess(null); onStatus?.(null); setError(cause instanceof Error ? cause.message : "Could not check rider approval."); }
    } finally { if (version === generation.current.value) setLoading(false); }
  }, [onStatus]);
  useEffect(() => {
    const guard = generation.current; let active = true;
    void load();
    const refresh = () => { if (active && !lock.current) void load(); };
    window.addEventListener("focus", refresh); window.addEventListener("alpharider:registration", refresh);
    const timer = setInterval(() => { if (document.visibilityState !== "hidden") refresh(); }, 30000);
    return () => { active = false; guard.value++; clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("alpharider:registration", refresh); };
  }, [load]);
  const update = async (next: Availability) => {
    if (lock.current || access?.approval !== "approved") return;
    lock.current = true; generation.current.value++; setBusy(true); setError("");
    try {
      const token = currentToken();
      await setAvailabilityFromDevice(next); checkSession(token);
      await load();
    } catch (cause) {
      if (!(cause instanceof LocationAccessError)) { setAccess(null); onStatus?.(null); }
      setError(`${cause instanceof Error ? cause.message : "Availability update failed."}${cause instanceof LocationAccessError ? "" : " Refresh your status before trying again."}`);
    } finally { lock.current = false; setBusy(false); }
  };
  const approved = access?.approval === "approved", status = approved ? access.status : null;
  return <section className={styles.card}><h2>Availability</h2>
    <p role="status">{loading ? "Checking rider approval…" : !access ? "Rider status unavailable" : !approved ? riderApprovalMessage(access.approval) : status === "available" ? "Online — available for requests" : status === "busy" ? "Busy — completing a delivery" : status === "offline" ? "Offline" : "Your registration is approved. Choose Online or Offline to set availability."}</p>
    <Message error={error} />
    <div className={styles.actions}>{approved && status ? <button role="switch" aria-checked={status === "available" || status === "busy"} disabled={loading || busy} onClick={() => void update(status === "offline" ? "available" : "offline")}>{busy ? "Updating…" : status === "offline" ? "Go online" : "Go offline"}</button> : approved ? <><button disabled={loading || busy} onClick={() => void update("available")}>Set online</button><button disabled={loading || busy} onClick={() => void update("offline")}>Set offline</button></> : null}
      {access?.approval === "missing" ? <Link className={styles.link} href="/rider#rider-registration">Complete rider registration</Link> : access && !approved ? <Link href="/rider#rider-registration">View registration</Link> : null}
      <button disabled={busy} onClick={() => void load()}>Refresh status</button>
    </div>
  </section>;
}
