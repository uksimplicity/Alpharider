import { accountRequest, checkSession, currentToken } from "./account-client";
import { rows, text, type Row } from "./backend-data";
import { mergeRiderJobs, riderJob } from "./rider-job";
import { reconcileJob } from "./rider-job-actions";

async function pages(path: string): Promise<Row[]> {
  const result: Row[] = [], seen = new Set<string>();
  for (let offset = 0; offset < 10000; offset += 100) {
    const page = rows(await accountRequest(`${path}${path.includes("?") ? "&" : "?"}limit=100&offset=${offset}`));
    for (const row of page) {
      const id = text(row.id ?? row.delivery_id);
      if (!id || seen.has(id)) throw new Error("The server returned an unreadable request list. Refresh before accepting a job.");
      seen.add(id); result.push(row);
    }
    if (page.length < 100) return result;
  }
  throw new Error("There are too many requests to load. Please contact support.");
}
export async function loadRiderInbox() {
  const token = currentToken();
  const [requested, assigned] = await Promise.all([pages("/rider/deliveries/requested"), pages("/rider/deliveries?status=assigned")]);
  checkSession(token);
  const jobs = mergeRiderJobs(requested, assigned);
  const receipts = await Promise.all(jobs.map(item => reconcileJob(text(item.id), item)));
  checkSession(token);
  return jobs.filter((item, index) => {
    const job = riderJob(item);
    return !job.terminal && !job.expired && !job.future && job.needsAcceptance && !receipts[index].accepted;
  });
}
