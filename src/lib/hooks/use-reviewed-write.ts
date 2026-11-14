"use client";
import { useEffect, useRef, useState } from "react";
import { needsActionReview, performReviewedAction, reviewAction } from "../reviewed-action";

export function useReviewedWrite(scope: string) {
  const lock = useRef(false);
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(""), [uncertain, setUncertain] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const pending = await needsActionReview(scope); if (active) { setUncertain(pending); setReady(true); } }
      catch (cause) { if (active) { setError(cause instanceof Error ? cause.message : "Could not check previous actions."); setUncertain(true); } }
    };
    void load(); window.addEventListener("storage", load);
    return () => { active = false; window.removeEventListener("storage", load); };
  }, [scope]);
  const execute = async (work: () => Promise<void>, review: boolean) => {
    if (lock.current || (!review && (!ready || uncertain))) return;
    lock.current = true; setBusy(true); setError("");
    try {
      if (review) await reviewAction(scope, work); else await performReviewedAction(scope, work);
      setUncertain(false); setReady(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The result could not be confirmed.");
      try { setUncertain(await needsActionReview(scope)); } catch { setUncertain(true); }
    } finally { lock.current = false; setBusy(false); }
  };
  return { busy: busy || !ready, error, uncertain, run: (work: () => Promise<void>) => execute(work, false), review: (work: () => Promise<void>) => execute(work, true) };
}
