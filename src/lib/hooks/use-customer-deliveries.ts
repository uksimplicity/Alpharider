"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ApiError } from "../api";
import { loadCustomerDeliveries, loadCustomerDelivery } from "../customer-deliveries";

const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener); window.addEventListener("alpharider:session", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("alpharider:session", listener); };
};
function useCustomerResource<T>(key: string, load: () => Promise<T>, enabled = true) {
  const token = useSyncExternalStore(subscribe, () => localStorage.getItem("alpharider_token") || "", () => "");
  const scope = `${token}:${key}`;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ scope: string; data: T | null; error: string; status?: number; checked: string }>({ scope: "", data: null, error: "", checked: "" });
  const refresh = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    if (!token || !enabled) return;
    let active = true, pending = false;
    const read = async () => {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const data = await load();
        if (active) setResult({ scope, data, error: "", checked: new Date().toISOString() });
      } catch (cause) {
        if (active) setResult({ scope, data: null, error: cause instanceof Error ? cause.message : "Could not refresh deliveries.", status: cause instanceof ApiError ? cause.status : undefined, checked: "" });
      } finally { pending = false; }
    };
    void read();
    const timer = setInterval(() => void read(), 20000);
    window.addEventListener("focus", read); document.addEventListener("visibilitychange", read);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", read); document.removeEventListener("visibilitychange", read); };
  }, [token, scope, load, enabled, attempt]);
  const current = result.scope === scope;
  return { data: current ? result.data : null, error: !token ? "Please sign in to view your deliveries." : current ? result.error : "", status: current ? result.status : undefined, checked: current ? result.checked : "", loading: Boolean(token && enabled && !current), refresh };
}
export function useCustomerDeliveries() { return useCustomerResource("deliveries", loadCustomerDeliveries); }
export function useCustomerDelivery(id: string) {
  const load = useCallback(() => loadCustomerDelivery(id), [id]);
  return useCustomerResource(`delivery:${id}`, load, Boolean(id));
}
