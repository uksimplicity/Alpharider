import { accountRequest, checkSession, currentToken } from "./account-client";
import { ApiError, requestJson } from "./api";
import { normalizeProfile, record, text, unwrap, type Row } from "./backend-data";
import { riderJob } from "./rider-job";

export type JobReceipt = { accepted?: boolean; pending?: { action: string; from: string } };
const accounts = new Map<string, Promise<string>>(), inFlight = new Set<string>();
export async function riderActionKey(scope: string, token = currentToken()) {
  let identity = accounts.get(token);
  if (!identity) {
    identity = (async () => {
      const profile = normalizeProfile(await accountRequest("/user/profile"));
      checkSession(token);
      const id = text(profile.id ?? profile._id ?? profile.user_id ?? profile.email);
      if (!id) throw new Error("Your account could not be identified. Sign in again.");
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id));
      return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    })();
    accounts.set(token, identity);
    void identity.catch(() => accounts.delete(token));
  }
  const id = await identity; checkSession(token);
  return `alpharider.action.v1.${id}.${encodeURIComponent(scope)}`;
}
function read(key: string): JobReceipt {
  const value = localStorage.getItem(key);
  if (!value) return {};
  try {
    const result = JSON.parse(value);
    if (!result || typeof result !== "object" || Array.isArray(result) || (result.accepted !== undefined && typeof result.accepted !== "boolean") || (result.pending !== undefined && (!result.pending || typeof result.pending.action !== "string" || typeof result.pending.from !== "string"))) throw new Error();
    return result;
  }
  catch { throw new Error("The previous action could not be read. Contact support before submitting again."); }
}
function save(key: string, value: JobReceipt) { localStorage.setItem(key, JSON.stringify(value)); }
export async function reconcileJob(id: string, raw: Row): Promise<JobReceipt> {
  const key = await riderActionKey(`job:${id}`), receipt = read(key), job = riderJob(raw);
  const progressed = ["picking_up", "on_the_way", "delivered", "completed"].includes(job.status);
  if (job.acceptanceReported || progressed) receipt.accepted = true;
  if (receipt.pending) {
    const target = receipt.pending.action;
    const order = ["assigned", "picking_up", "on_the_way", "delivered", "completed"];
    if (job.terminal || (target === "accept" ? job.acceptanceReported || progressed : job.status === target || (order.includes(target) && order.indexOf(job.status) > order.indexOf(target)))) delete receipt.pending;
  }
  save(key, receipt); return receipt;
}
export async function performJobAction(id: string, action: string, code = "") {
  const token = currentToken(), key = await riderActionKey(`job:${id}`, token);
  const work = async () => {
    if (inFlight.has(key)) throw new Error("This job is already being updated.");
    inFlight.add(key);
    try {
      const payload = unwrap(await accountRequest(`/rider/deliveries/${encodeURIComponent(id)}`));
      const raw = record(payload.delivery ?? payload);
      const receipt = await reconcileJob(id, raw), job = riderJob(raw);
      if (receipt.pending) throw new Error("The previous action is still unconfirmed. Refresh the job or contact support before trying again.");
      if (action === "accept" && receipt.accepted) return;
      if (job.terminal || job.expired || job.future) throw new ApiError("This job is not currently available for this action. Refresh its details.", 409, null);
      if (action === "accept" ? !job.needsAcceptance : action === "cancelled" ? !["assigned", "picking_up"].includes(job.status) || (job.needsAcceptance && !receipt.accepted) : job.nextStatus(receipt.accepted) !== action) throw new ApiError("This job has changed. Refresh its details before continuing.", 409, null);
      if (action === "completed" && job.requiresCode && !code.trim()) throw new ApiError("Enter the customer's completion code.", 400, null);
      checkSession(token);
      save(key, { ...receipt, pending: { action, from: job.status } });
      try {
        await requestJson(`/rider/deliveries/${encodeURIComponent(id)}/${action === "accept" ? "accept" : "status"}`, {
          method: action === "accept" ? "POST" : "PUT", headers: { Authorization: `Bearer ${token}` },
          ...(action !== "accept" ? { body: JSON.stringify({ status: action, ...(action === "completed" && job.requiresCode ? { completed_code: code.trim() } : {}) }) } : {}),
        });
        save(key, { ...receipt, ...(action === "accept" ? { accepted: true, pending: undefined } : { pending: { action, from: job.status } }) });
      } catch (error) {
        if (error instanceof ApiError && error.status < 500 && error.status !== 408) save(key, { ...receipt, pending: undefined });
        throw error;
      }
      checkSession(token);
    } finally { inFlight.delete(key); }
  };
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request(key, work);
  return work();
}
