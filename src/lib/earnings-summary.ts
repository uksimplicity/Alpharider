import { accountRequest, checkSession, currentToken } from "./account-client";
import { rows, text } from "./backend-data";

function kobo(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value).trim());
  if (!match) return null;
  const amount = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : null;
}

export async function loadEarningsSummary(_path: string) {
  const token = currentToken(), seen = new Set<string>();
  let total = 0, unpaid = 0, paid = 0, unclassified = 0;
  for (let offset = 0; offset < 4000; offset += 20) {
    const page = rows(await accountRequest(`/rider/earnings?limit=20&offset=${offset}`));
    checkSession(token);
    for (const item of page) {
      const id = text(item.id ?? item.earning_id), value = kobo(item.earning_amount ?? item.rider_earning ?? item.amount ?? item.earnings);
      if (!id || seen.has(id) || value === null) throw new Error("Delivery earnings could not be totaled reliably. Refresh or contact support.");
      seen.add(id);
      total += value;
      const status = text(item.status ?? item.payout_status).toLowerCase();
      if (status === "paid") paid += value;
      else if (status === "unpaid") unpaid += value;
      else unclassified += value;
      if (![total, unpaid, paid, unclassified].every(Number.isSafeInteger)) throw new Error("Delivery earnings total is unavailable.");
    }
    if (page.length < 20) return { total: total / 100, unpaid: unpaid / 100, paid: paid / 100, unclassified: unclassified / 100 };
  }
  throw new Error("Delivery earnings history is too large to total here. Contact support for your full balance.");
}
