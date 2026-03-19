const SESSION_KEYS = [
  "alpharider_token",
  "alpharider_email",
  "alpharider_display_name",
  "alpharider_username",
  "alpharider_active_delivery_id",
  "alpharider_pending_email",
  "alpharider_pending_phone",
  "alpharider_reset_email",
  "alpharider_is_verified",
  "alpharider_last_activity_at",
] as const;

export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const markSessionActivity = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem("alpharider_last_activity_at", String(Date.now()));
};

export const isSessionExpired = (
  now = Date.now(),
  timeoutMs = INACTIVITY_TIMEOUT_MS
) => {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem("alpharider_last_activity_at");
  if (!raw) return false;
  const lastActivity = Number(raw);
  if (!Number.isFinite(lastActivity)) return false;
  return now - lastActivity > timeoutMs;
};

