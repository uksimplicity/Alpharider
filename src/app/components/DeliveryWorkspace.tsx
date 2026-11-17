"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import RiderShell, { Message, riderStyles as styles } from "./RiderShell";
import { useBackend, useStoredQuery } from "@/lib/hooks/use-backend";
import { date, money, record, text, unwrap } from "@/lib/backend-data";
import { riderJob } from "@/lib/rider-job";
import { loadRiderDelivery, performJobAction, reconcileJob, type JobReceipt } from "@/lib/rider-job-actions";
import { riderAccess, riderApprovalMessage, riderProfileMissing } from "@/lib/rider-access";
import DeliveryReviewError from "./DeliveryReviewError";
import RequestDecisionButtons from "./RequestDecisionButtons";
import DeliveryContacts from "./DeliveryContacts";

export default function DeliveryWorkspace() {
  const id = useStoredQuery("id", "alpharider_active_delivery_id");
  const [code, setCode] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; data: JobReceipt; error: string } | null>(null);
  const lock = useRef(false);
  const resource = useBackend(id || null, 20000, loadRiderDelivery);
  const rider = useBackend("/rider/profile", 30000);
  const approval = rider.data ? riderAccess(rider.data).approval : riderProfileMissing(rider.errorStatus, rider.error) ? "missing" : "unknown";
  const root = unwrap(resource.data), delivery = record(root.delivery ?? root), job = riderJob(delivery);
  useEffect(() => {
    let active = true;
    if (resource.data && id) {
      const value = unwrap(resource.data);
      void reconcileJob(id, record(value.delivery ?? value)).then(data => { if (active) setReceipt({ id, data, error: "" }); }).catch(cause => { if (active) setReceipt({ id, data: {}, error: cause instanceof Error ? cause.message : "Could not check the previous action." }); });
    }
    return () => { active = false; };
  }, [id, resource.data]);
  const saved = receipt?.id === id ? receipt : null;
  const accepted = Boolean(saved?.data.accepted), needsAcceptance = job.needsAcceptance && !accepted;
  const blocked = busy || rider.loading || approval !== "approved" || resource.loading || Boolean(resource.error) || !saved || Boolean(saved.error) || Boolean(saved.data.pending) || job.expired || job.future || job.terminal;
  const next = job.nextStatus(accepted);
  const act = async (action: string) => {
    if (blocked || lock.current) return;
    if (!window.confirm(action === "accept" ? `Accept this ${job.kindLabel.toLowerCase()}?\nPickup: ${text(delivery.pickup_address)}\nDestination: ${text(delivery.dropoff_address)}\nFee: ${money(delivery.delivery_fee ?? delivery.fee ?? delivery.amount)}` : action === "cancelled" ? "Cancel this assigned job?" : `${job.actionLabel(action)}?`)) return;
    lock.current = true; setBusy(true); setError("");
    try { await performJobAction(id, action, code); setCode(""); if (action === "accept") localStorage.setItem("alpharider_active_delivery_id", id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The action could not be confirmed."); }
    finally { lock.current = false; setBusy(false); setReceipt(null); resource.refresh(); }
  };
  const activeDeliveryId = !needsAcceptance && !job.terminal && ["assigned", "picking_up", "on_the_way", "delivered"].includes(job.status) ? id : undefined;
  return <RiderShell activeDeliveryId={activeDeliveryId}><h1>{job.kind === "passenger" ? "Ride details" : "Delivery details"}</h1>
    {!id ? <section className={styles.card}><p>Select a job to view its details.</p><Link href="/rider/deliveries">My jobs</Link></section> : resource.error ? <DeliveryReviewError id={id} error={resource.error} status={resource.errorStatus} retry={resource.refresh} className={styles.card} /> : !resource.data ? <p>Loading job…</p> : <>
      <section className={styles.card}><span className={styles.badge}>{job.sourceLabel} · {job.kindLabel} · {job.status || "Status unavailable"}</span><h2>{text(delivery.delivery_number) || text(delivery.reference) || text(delivery.id) || id}</h2>
        {needsAcceptance ? <p className={styles.muted}>Review the available request information below. Full delivery details become available after you accept.</p> : null}
        <p><strong>Pickup:</strong> {text(delivery.pickup_address, "Unavailable")}</p><p><strong>Destination:</strong> {text(delivery.dropoff_address, "Unavailable")}</p><p><strong>Created:</strong> {date(delivery.created_at)}</p>
        <DeliveryContacts delivery={delivery} accepted={accepted} />
        {job.scheduledFor ? <p><strong>Scheduled pickup:</strong> {date(new Date(job.scheduledFor).toISOString())}</p> : null}{job.expiresAt ? <p><strong>Request expires:</strong> {date(new Date(job.expiresAt).toISOString())}</p> : null}
        <p><strong>Fee:</strong> {money(delivery.delivery_fee ?? delivery.fee ?? delivery.amount)}</p>
        {delivery.notes ? <p>{text(delivery.notes)}</p> : null}<div className={styles.actions}><button disabled={busy} onClick={resource.refresh}>Refresh job</button></div>
      </section>
      <section className={styles.card}><h2>Job actions</h2><Message error={error || saved?.error || ""} />
        {rider.loading ? <p>Checking rider approval…</p> : approval !== "approved" ? <p role="status">{riderApprovalMessage(approval)} <Link href="/rider#rider-registration">View rider registration</Link></p> : null}
        {saved?.data.pending ? <p role="alert">The previous action has not been confirmed. Refresh the job to check its status. If it remains unchanged, contact support before submitting again.</p> : null}
        {job.expired ? <p>This request is no longer available.</p> : job.future ? <p>This job is scheduled for a later time. It cannot be started yet.</p> : job.terminal ? <p>This job is {job.status}.</p> : null}
        <div className={styles.actions}>{needsAcceptance ? <RequestDecisionButtons disabled={blocked} busy={busy} acceptLabel={`Accept ${job.kind === "passenger" ? "ride" : "delivery"}`} onAccept={() => void act("accept")} /> : null}
          {!needsAcceptance && next ? <div className={styles.form}>{next === "completed" && job.requiresCode ? <label>Customer completion code<input value={code} onChange={event => setCode(event.target.value)} inputMode="numeric" autoComplete="off" /></label> : null}<button disabled={blocked || (next === "completed" && job.requiresCode && !code.trim())} onClick={() => void act(next)}>{busy ? "Updating…" : job.actionLabel(next)}</button></div> : null}
          {!needsAcceptance && ["assigned", "picking_up"].includes(job.status) ? <button disabled={blocked} onClick={() => void act("cancelled")}>Cancel job</button> : null}<Link href="/rider/deliveries">Back to my jobs</Link></div>
      </section>
    </>}
  </RiderShell>;
}
