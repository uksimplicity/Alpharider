import { rows, text } from "./backend-data";

export function deliveryWalletCredits(payload: unknown, deliveryId: string) {
  if (!deliveryId) return [];
  return rows(payload).filter(row => text(row.delivery_id ?? row.reference_id) === deliveryId && text(row.type ?? row.transaction_type).toLowerCase() === "credit");
}

export function deliveryEarnings(payload: unknown, deliveryId: string) {
  if (!deliveryId) return [];
  return rows(payload).filter(row => text(row.delivery_id ?? row.deliveryId) === deliveryId);
}

// Convert currency values to kobo without floating-point rounding or guessing.
function kobo(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value).trim());
  if (!match) return null;
  const whole = Number(match[1]), fraction = Number((match[2] ?? "").padEnd(2, "0"));
  const result = whole * 100 + fraction;
  return Number.isSafeInteger(result) ? result : null;
}

export function expectedDeliveryCredit(fee: unknown, commission: unknown): number | null {
  const total = kobo(fee), charge = kobo(commission);
  return total === null || charge === null || charge > total ? null : (total - charge) / 100;
}
