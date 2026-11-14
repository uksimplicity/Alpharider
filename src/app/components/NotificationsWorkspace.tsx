"use client";
import { useState } from "react";
import RiderShell, { Message, Pager, riderStyles as styles } from "./RiderShell";
import { useBackend, useWrite } from "@/lib/hooks/use-backend";
import { accountRequest } from "@/lib/account-client";
import { date, rows, text, unwrap } from "@/lib/backend-data";
export default function NotificationsWorkspace() {
  const [offset, setOffset] = useState(0);
  const list = useBackend(`/user/notifications?limit=20&offset=${offset}`, 30000), count = useBackend("/user/notifications/unread-count", 30000), write = useWrite();
  let items: ReturnType<typeof rows> = [], error = list.error;
  try { if (list.data) items = rows(list.data); } catch (cause) { error = cause instanceof Error ? cause.message : "Could not read notifications."; }
  const update = (path: string, method: string) => void write.run(async () => { await accountRequest(path, { method }); list.refresh(); count.refresh(); });
  return <RiderShell><h1>Notifications</h1><div className={styles.actions}><span>{typeof unwrap(count.data).unread_count === "number" ? `${unwrap(count.data).unread_count} unread` : ""}</span><button disabled={write.busy || write.uncertain} onClick={() => update("/user/notifications/read-all", "POST")}>Mark all as read</button><button onClick={() => { list.refresh(); count.refresh(); }}>Refresh</button></div><Message error={error || count.error || write.error} uncertain={write.uncertain} /><section className={styles.card}>{list.loading ? <p>Loading notifications…</p> : items.length ? items.map(item => <article key={text(item.id)} className={styles.message}><h2>{text(item.title, "Notification")}</h2><p>{text(item.body)}</p><small>{date(item.last_event_at ?? item.created_at)}</small><div className={styles.actions}>{item.is_read !== true && !item.read_at ? <button disabled={write.busy || write.uncertain} onClick={() => update(`/user/notifications/${encodeURIComponent(text(item.id))}/read`, "PATCH")}>Mark read</button> : <span>Read</span>}<button disabled={write.busy || write.uncertain} onClick={() => { if (window.confirm("Delete this notification?")) update(`/user/notifications/${encodeURIComponent(text(item.id))}`, "DELETE"); }}>Delete</button></div></article>) : !error ? <p>No notifications yet.</p> : null}<Pager offset={offset} count={items.length} onPage={setOffset} /></section></RiderShell>;
}
