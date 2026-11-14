import { checkSession, currentToken } from "./account-client";
import { ApiError } from "./api";
import { riderActionKey } from "./rider-job-actions";

const locks = new Set<string>();
async function exclusive<T>(key: string, work: () => Promise<T>) {
  const run = async () => {
    if (locks.has(key)) throw new Error("Another account action is still in progress.");
    locks.add(key); try { return await work(); } finally { locks.delete(key); }
  };
  return typeof navigator !== "undefined" && navigator.locks ? navigator.locks.request(key, run) : run();
}
export async function needsActionReview(scope: string) { return localStorage.getItem(await riderActionKey(`review:${scope}`)) !== null; }
export async function performReviewedAction(scope: string, work: () => Promise<void>) {
  const token = currentToken(), key = await riderActionKey(`review:${scope}`, token);
  return exclusive(key, async () => {
    if (localStorage.getItem(key) !== null) throw new Error("Review the previous action by refreshing account records before continuing.");
    checkSession(token); localStorage.setItem(key, "pending");
    try { await work(); localStorage.removeItem(key); }
    catch (cause) { if (cause instanceof ApiError && cause.status < 500 && cause.status !== 408) localStorage.removeItem(key); throw cause; }
    checkSession(token);
  });
}
export async function reviewAction(scope: string, readbacks: () => Promise<void>) {
  const token = currentToken(), key = await riderActionKey(`review:${scope}`, token);
  return exclusive(key, async () => { await readbacks(); checkSession(token); localStorage.removeItem(key); });
}
