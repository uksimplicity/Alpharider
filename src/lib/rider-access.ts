import { accountRequest } from "./account-client";
import { ApiError } from "./api";
import { availability, record, text, unwrap, type Availability, type Row } from "./backend-data";

export type RiderApproval = "missing" | "pending" | "approved" | "rejected" | "suspended" | "unknown";
export type RiderAccess = { approval: RiderApproval; status: Availability | null; details: Row };

export function riderProfileMissing(status: number | undefined, message: string) {
  if (status === 404) return true;
  return [200, 400, 500].includes(status ?? 0) && /^rider profile not found[.!]?$/i.test(message.trim());
}
export function riderDetails(value: unknown): Row {
  const root = unwrap(value), profile = record(root.profile);
  for (const candidate of [root.rider, root.rider_profile, root.riderProfile, profile.rider, profile.rider_profile]) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) return record(candidate);
  }
  return Object.keys(profile).length ? profile : root;
}
export function riderAccess(value: unknown): RiderAccess {
  const details = riderDetails(value);
  // These fields belong to the rider record. Email/account verification under
  // `user` and available/offline status do not establish admin rider approval.
  const states = [details.verification_status, details.kyc_status, details.approval_status].map(value => text(value).toLowerCase());
  const flags = [details.is_verified, details.verified, details.is_approved, details.approved];
  const approval: RiderApproval = states.some(value => ["suspended", "blocked", "disabled"].includes(value)) ? "suspended"
    : states.some(value => ["rejected", "declined"].includes(value)) ? "rejected"
    : flags.includes(false) || states.some(value => ["pending", "unverified", "not_verified", "in_review", "under_review", "submitted"].includes(value)) ? "pending"
    : flags.includes(true) || states.some(value => ["approved", "verified"].includes(value)) ? "approved"
    : "unknown";
  return { approval, status: availability(details), details };
}
export const riderApprovalMessage = (approval: RiderApproval) => ({
  missing: "Complete your rider registration and upload your documents. An admin must approve you before you can go online or take jobs.",
  pending: "Your rider registration is awaiting admin approval. You can go online and take jobs once approved.",
  rejected: "Your rider registration was not approved. Contact support to resolve the review before taking jobs.",
  suspended: "Your rider access is suspended. Contact support before taking jobs.",
  unknown: "Your rider approval could not be confirmed. Refresh your status or contact support before taking jobs.",
  approved: "Your rider registration is approved.",
})[approval];

export async function getRiderAccess(): Promise<RiderAccess> {
  try { return riderAccess(await accountRequest("/rider/profile")); }
  catch (cause) {
    if (cause instanceof ApiError && riderProfileMissing(cause.status, cause.message)) return { approval: "missing", status: null, details: {} };
    throw cause;
  }
}
export async function requireApprovedRider() {
  const access = await getRiderAccess();
  if (access.approval !== "approved") throw new ApiError(riderApprovalMessage(access.approval), 403, null);
  return access;
}
