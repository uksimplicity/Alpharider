export type Row = Record<string, unknown>;
export const record = (value: unknown): Row => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
export const text = (value: unknown, fallback = "") => typeof value === "string" || typeof value === "number" ? String(value).trim() : fallback;
export function unwrap(value: unknown): Row {
  const row = record(value);
  for (const key of ["data", "result", "payload"]) if (row[key] && !Array.isArray(row[key]) && typeof row[key] === "object") return unwrap(row[key]);
  return row;
}
export function rows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.map(record);
  const row = record(value);
  for (const key of ["data", "items", "results", "rows", "records", "deliveries", "transactions", "notifications", "commissions", "earnings", "withdrawals", "banks", "conversations", "messages", "settings", "categories"]) {
    if (Array.isArray(row[key])) return rows(row[key]);
    if (row[key] && typeof row[key] === "object") { try { return rows(row[key]); } catch { /* Try the next documented container. */ } }
  }
  throw new Error("The server returned an unreadable list. Please refresh.");
}
export function numeric(value: unknown): number | null {
  if (value === null || value === undefined || typeof value === "boolean" || typeof value === "object" || String(value).trim() === "") return null;
  const number = Number(value); return Number.isFinite(number) ? number : null;
}
export function money(value: unknown) { const amount = numeric(value); return amount === null ? "Unavailable" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount); }
export function date(value: unknown) { const time = Date.parse(text(value)); return Number.isFinite(time) ? new Date(time).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }) : "—"; }
export function amount(value: unknown, keys: string[] = ["balance", "available_balance", "wallet_balance"]): number | null {
  const row = unwrap(value);
  for (const source of [row, record(row.wallet), record(row.summary)]) for (const key of keys) { const result = numeric(source[key]); if (result !== null) return result; }
  return numeric(value);
}
export type Availability = "available" | "busy" | "offline";
export function availability(value: unknown): Availability | null {
  const row = unwrap(value);
  for (const source of [record(row.rider), record(row.profile), row]) {
    const status = text(source.status ?? source.rider_status).toLowerCase();
    if (["available", "busy", "offline"].includes(status)) return status as Availability;
    if (typeof source.is_online === "boolean") return source.is_online ? "available" : "offline";
  }
  return null;
}
export function normalizeProfile(value: unknown): Row {
  const root = unwrap(value), profile = record(root.profile), user = record(root.user);
  const source = { ...root, ...profile, ...record(profile.user), ...user };
  if (![source.id, source._id, source.user_id, source.email, source.first_name, source.firstName, source.phone].some(value => text(value))) throw new Error("The server returned an unreadable profile.");
  return { ...source, first_name: source.first_name ?? source.firstName, last_name: source.last_name ?? source.lastName, phone: source.phone ?? source.phone_number ?? source.phoneNumber, profile_picture: source.profile_picture ?? source.profilePicture, postal_code: source.postal_code ?? source.postalCode };
}
export const profileName = (value: unknown) => { const row = record(value); return [text(row.first_name), text(row.last_name)].filter(Boolean).join(" ") || text(row.name ?? row.full_name); };
