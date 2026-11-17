"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { accountRequest } from "../account-client";
import { ApiError } from "../api";

const subscribeLocation = (callback: () => void) => { window.addEventListener("popstate", callback); window.addEventListener("storage", callback); return () => { window.removeEventListener("popstate", callback); window.removeEventListener("storage", callback); }; };
export function useStoredQuery(name: string, fallbackKey?: string) {
  return useSyncExternalStore(subscribeLocation, () => new URLSearchParams(window.location.search).get(name) ?? (fallbackKey ? localStorage.getItem(fallbackKey) ?? "" : ""), () => "");
}

export function useBackend(path: string | null, poll = 0, loadResource: (path: string) => Promise<unknown> = accountRequest) {
  const token = useSyncExternalStore(subscribeLocation, () => localStorage.getItem("alpharider_token") ?? "", () => "");
  const key = `${token}:${path}`;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string | null; data: unknown; error: string; errorStatus?: number; loading: boolean }>({ key: null, data: null, error: "", loading: true });
  const refresh = useCallback(() => { setResult(previous => ({ ...previous, loading: true })); setAttempt(value => value + 1); }, []);
  useEffect(() => {
    if (!path) return;
    let active = true, pending = false;
    const load = async () => {
      if (pending) return; pending = true;
      try { const data = await loadResource(path); if (active) setResult({ key, data, error: "", loading: false }); }
      catch (error) { if (active) setResult({ key, data: null, error: error instanceof Error ? error.message : "Could not load data.", errorStatus: error instanceof ApiError ? error.status : undefined, loading: false }); }
      finally { pending = false; }
    };
    void load();
    const visibleLoad = () => { if (document.visibilityState !== "hidden") void load(); };
    const timer = poll ? window.setInterval(visibleLoad, poll) : null;
    window.addEventListener("focus", visibleLoad);
    return () => { active = false; if (timer) clearInterval(timer); window.removeEventListener("focus", visibleLoad); };
  }, [path, key, attempt, poll, loadResource]);
  return { data: result.key === key ? result.data : null, error: result.key === key ? result.error : "", errorStatus: result.key === key ? result.errorStatus : undefined, loading: Boolean(path) && result.key !== key ? true : result.loading, refresh };
}
export function useWrite() {
  const lock = useRef(false), uncertainRef = useRef(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [uncertain, setUncertain] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | undefined>();
  const run = async (work: () => Promise<void>) => {
    if (lock.current || uncertainRef.current) return;
    lock.current = true; setBusy(true); setError(""); setErrorStatus(undefined);
    try { await work(); }
    catch (cause) {
      const unknown = !(cause instanceof ApiError) || cause.status >= 500;
      if (unknown) { uncertainRef.current = true; setUncertain(true); }
      setError(cause instanceof Error ? cause.message : "The request failed.");
      setErrorStatus(cause instanceof ApiError ? cause.status : undefined);
    } finally { lock.current = false; setBusy(false); }
  };
  return { run, busy, error, errorStatus, uncertain };
}
