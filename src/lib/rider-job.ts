import { record, text, type Row } from "./backend-data";

export function riderJob(raw: Row, now = Date.now()) {
  const status = text(raw.status).toLowerCase(), notes = text(raw.notes);
  const legacyRide = /(^|\|)\s*Ride type:/i.test(notes) || (Array.isArray(raw.items) && raw.items.some(item => text(record(item).name).toLowerCase() === "ride"));
  const sourceValue = text(raw.source || raw.delivery_source).toLowerCase();
  const source = sourceValue === "marketplace" ? "marketplace" : ["rider_app", "alpharide", "alpha_ride", "alpharider"].includes(sourceValue) || legacyRide ? "alpharide" : "unknown";
  const kindValue = text(raw.job_type || raw.service_type).toLowerCase();
  const kind = source === "marketplace" ? "package" : ["ride", "passenger", "passenger_ride"].includes(kindValue) ? "passenger" : ["package", "delivery", "package_delivery"].includes(kindValue) ? "package" : legacyRide ? "passenger" : source === "alpharide" ? "package" : "unknown";
  const timestamp = (value: unknown) => { const number = Date.parse(text(value)); return Number.isFinite(number) ? number : null; };
  const scheduledFor = timestamp(raw.scheduled_for) ?? timestamp(raw.scheduled_at) ?? timestamp(notes.match(/(^|\|)\s*Scheduled for:\s*([^|]+)/i)?.[2]);
  const expiresAt = timestamp(raw.expires_at);
  const terminal = ["completed", "cancelled", "expired"].includes(status);
  const acceptanceReported = raw.requires_acceptance === false || Boolean(text(raw.accepted_at)) || text(raw.acceptance_status).toLowerCase() === "accepted";
  const needsAcceptance = !terminal && !acceptanceReported && (status === "requested" || (status === "assigned" && (raw.requires_acceptance === true || text(raw.acceptance_status).toLowerCase() === "pending" || source !== "alpharide")));
  return {
    status, source, kind, terminal, acceptanceReported, needsAcceptance, scheduledFor, expiresAt,
    future: scheduledFor !== null && scheduledFor > now,
    expired: status === "expired" || (status === "requested" && expiresAt !== null && expiresAt <= now),
    requiresCode: kind !== "passenger" && raw.requires_completion_code !== false && raw.completion_code_required !== false,
    sourceLabel: source === "marketplace" ? "Marketplace" : source === "alpharide" ? "AlphaRide" : "Source not reported",
    kindLabel: kind === "passenger" ? "Passenger ride" : kind === "package" ? "Package delivery" : "Delivery",
    nextStatus(accepted = false): string | null {
      if (needsAcceptance && !accepted) return null;
      return ({ assigned: "picking_up", picking_up: "on_the_way", on_the_way: kind === "passenger" ? "completed" : "delivered", delivered: "completed" } as Record<string, string>)[status] ?? null;
    },
    actionLabel(next: string) {
      return ({ picking_up: "Head to pickup", on_the_way: kind === "passenger" ? "Start ride" : "Package collected", delivered: "Package delivered", completed: kind === "passenger" ? "Complete ride" : "Confirm delivery completion" } as Record<string, string>)[next] ?? next;
    },
  };
}

export function mergeRiderJobs(requested: Row[], assigned: Row[]) {
  const merged = new Map<string, Row>();
  for (const item of [...requested, ...assigned]) {
    const id = text(item.id ?? item.delivery_id);
    if (id) merged.set(id, { ...merged.get(id), ...item, id });
  }
  return [...merged.values()];
}
