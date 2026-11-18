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
import progressStyles from "./delivery-workspace.module.css";

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
  const passenger = job.kind === "passenger";
  const steps = passenger
    ? [{ key: "assigned", label: "Accepted", description: "Your ride is confirmed." }, { key: "picking_up", label: "Head to pickup", description: "Make your way to the passenger." }, { key: "on_the_way", label: "Ride in progress", description: "Take the passenger to their destination." }, { key: "completed", label: "Complete", description: "Confirm the ride is complete." }]
    : [{ key: "assigned", label: "Accepted", description: "Your delivery is confirmed." }, { key: "picking_up", label: "Head to pickup", description: "Make your way to the pickup address." }, { key: "on_the_way", label: "On the way", description: "Collect the package and head to the destination." }, { key: "delivered", label: "Delivered", description: "Hand the package to the recipient." }, { key: "completed", label: "Complete", description: "Confirm the delivery is complete." }];
  const stepIndex = needsAcceptance ? -1 : steps.findIndex(step => step.key === job.status);
  const stopped = job.status === "cancelled" || job.status === "expired";
  return <RiderShell activeDeliveryId={activeDeliveryId}><h1>{job.kind === "passenger" ? "Ride details" : "Delivery details"}</h1>
    {!id ? <section className={styles.card}><p>Select a job to view its details.</p><Link href="/rider/deliveries">My jobs</Link></section> : resource.error ? <DeliveryReviewError id={id} error={resource.error} status={resource.errorStatus} retry={resource.refresh} className={styles.card} /> : !resource.data ? <p>Loading job…</p> : <>
      <section className={`${styles.card} ${progressStyles.workspace}`}>
        <div className={progressStyles.heading}><div><span className={progressStyles.eyebrow}>{job.sourceLabel} · {job.kindLabel}</span><h2>{needsAcceptance ? "Ready to accept?" : job.status === "completed" ? "Job complete" : stopped ? `Job ${job.status}` : next ? job.actionLabel(next) : "Job progress"}</h2><p className={progressStyles.reference}>{text(delivery.delivery_number) || text(delivery.reference) || text(delivery.id) || id}</p></div><span className={progressStyles.amount}>{money(delivery.delivery_fee ?? delivery.fee ?? delivery.amount)}<small>Delivery fee</small></span></div>
        <Message error={error || saved?.error || ""} />
        {rider.loading ? <p>Checking rider approval…</p> : approval !== "approved" ? <p role="status">{riderApprovalMessage(approval)} <Link href="/rider#rider-registration">View rider registration</Link></p> : null}
        {saved?.data.pending ? <p role="alert">The previous action has not been confirmed. Refresh the job to check its status. If it remains unchanged, contact support before submitting again.</p> : null}
        {job.expired ? <p>This request is no longer available.</p> : job.future ? <p>This job is scheduled for a later time. It cannot be started yet.</p> : job.terminal ? <p>This job is {job.status}.</p> : null}
        {needsAcceptance ? <p className={styles.muted}>Review the route below, then accept to get started.</p> : null}
        <div className={styles.actions}>{needsAcceptance ? <RequestDecisionButtons disabled={blocked} busy={busy} acceptLabel={`Accept ${passenger ? "ride" : "delivery"}`} onAccept={() => void act("accept")} /> : null}
          {!needsAcceptance && next ? <div className={styles.form}>{next === "completed" && job.requiresCode ? <label>Customer completion code<input value={code} onChange={event => setCode(event.target.value)} inputMode="numeric" autoComplete="off" /></label> : null}<button className={styles.primary} disabled={blocked || (next === "completed" && job.requiresCode && !code.trim())} onClick={() => void act(next)}>{busy ? "Updating…" : job.actionLabel(next)}</button></div> : null}
          {!needsAcceptance && ["assigned", "picking_up"].includes(job.status) ? <button disabled={blocked} onClick={() => void act("cancelled")}>Cancel job</button> : null}<button disabled={busy} onClick={resource.refresh}>Refresh job</button></div>
        <div className={progressStyles.progressHeader}><h3>Journey progress</h3><span>{stopped ? `Job ${job.status}` : stepIndex >= 0 ? `Step ${stepIndex + 1} of ${steps.length}` : needsAcceptance ? "Awaiting acceptance" : "Status unavailable"}</span></div>
        <ol className={progressStyles.steps}>{steps.map((step, index) => { const state = stopped || stepIndex < 0 ? "upcoming" : index < stepIndex || job.status === "completed" ? "done" : index === stepIndex ? "current" : "upcoming"; return <li key={step.key} className={progressStyles.step} data-state={state} aria-current={state === "current" ? "step" : undefined}><span className={progressStyles.marker} aria-hidden="true">{state === "done" ? "✓" : index + 1}</span><div><strong>{step.label}</strong><p>{step.description}</p><span className={progressStyles.stepState}>{state === "done" ? "Done" : state === "current" ? "Current" : "Upcoming"}</span></div></li>; })}</ol>
      </section>
      <section className={styles.card}><div className={progressStyles.detailsHeading}><div><span className={progressStyles.eyebrow}>YOUR ROUTE</span><h2>Delivery details</h2></div><Link href="/rider/deliveries">Back to my jobs</Link></div>
        <div className={progressStyles.route}><div><span>Pickup</span><strong>{text(delivery.pickup_address, "Unavailable")}</strong></div><div><span>Destination</span><strong>{text(delivery.dropoff_address, "Unavailable")}</strong></div></div>
        <DeliveryContacts delivery={delivery} accepted={accepted} />
        <p className={styles.muted}>Created: {date(delivery.created_at)}</p>
        {job.scheduledFor ? <p><strong>Scheduled pickup:</strong> {date(new Date(job.scheduledFor).toISOString())}</p> : null}{job.expiresAt ? <p><strong>Request expires:</strong> {date(new Date(job.expiresAt).toISOString())}</p> : null}
        {delivery.notes ? <p>{text(delivery.notes)}</p> : null}
      </section>
    </>}
  </RiderShell>;
}
