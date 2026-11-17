import { checkSession, currentToken } from "./account-client";
import { text } from "./backend-data";
import { riderJob } from "./rider-job";
import { listRiderDeliveries } from "./rider-delivery-list";
import { reconcileJob } from "./rider-job-actions";
import { requireApprovedRider } from "./rider-access";

export async function loadRiderInbox() {
  const token = currentToken();
  await requireApprovedRider(); checkSession(token);
  const jobs = await listRiderDeliveries();
  checkSession(token);
  const receipts = await Promise.all(jobs.map(item => reconcileJob(text(item.id), item)));
  checkSession(token);
  return jobs.filter((item, index) => {
    const job = riderJob(item);
    return !job.terminal && !job.expired && !job.future && job.needsAcceptance && !receipts[index].accepted;
  });
}
