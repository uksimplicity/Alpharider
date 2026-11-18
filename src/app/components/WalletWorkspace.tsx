"use client";
import { useState } from "react";
import Link from "next/link";
import RiderShell, { Message, Pager, riderStyles as styles } from "./RiderShell";
import MobilityShell from "./MobilityShell";
import { useBackend } from "@/lib/hooks/use-backend";
import { amount, date, money, rows, text, unwrap } from "@/lib/backend-data";
import Payouts from "./Payouts";

export default function WalletWorkspace({ rider = false }: { rider?: boolean }) {
  const [offset, setOffset] = useState(0), [filter, setFilter] = useState("");
  const wallet = useBackend("/wallet/balance", 30000), stats = useBackend("/wallet/stats"), history = useBackend(`/wallet/transactions${filter ? `/filter?type=${filter}&` : "?"}limit=20&offset=${offset}`);
  let list: ReturnType<typeof rows> = [], error = history.error;
  try { if (history.data) list = rows(history.data); } catch (cause) { error = cause instanceof Error ? cause.message : "Could not read transactions."; }
  const Shell = rider ? RiderShell : MobilityShell;
  return <Shell><div className={styles.main}><h1>Wallet</h1><section className={styles.card}><h2>Available balance</h2><Message error={wallet.error} /><p className={styles.metric}>{wallet.loading ? "Loading…" : money(amount(wallet.data))}</p><button onClick={() => { wallet.refresh(); history.refresh(); stats.refresh(); }}>Refresh wallet</button>{rider ? <p className={styles.muted}>Unpaid delivery earnings are separate from your wallet balance. <Link href="/rider/earnings">View delivery earnings</Link></p> : <p className={styles.muted}>Wallet funding will be available when the payment service is connected.</p>}</section><section className={styles.card}><h2>Wallet activity</h2><Message error={stats.error} />{stats.loading ? <p>Loading totals…</p> : <div className={styles.grid}>{[["Total credits", "total_credits"], ["Total debits", "total_debits"]].map(([label, key]) => <p key={key}>{label}: <strong>{money(unwrap(stats.data)[key])}</strong></p>)}</div>}</section><section className={styles.card}><h2>Transactions</h2><label>Type <select value={filter} onChange={event => { setFilter(event.target.value); setOffset(0); }}><option value="">All</option><option value="credit">Credit</option><option value="debit">Debit</option></select></label><Message error={error} />{history.loading ? <p>Loading transactions…</p> : list.length ? <div className={styles.table}><table><thead><tr><th>Description</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead><tbody>{list.map((item, index) => <tr key={text(item.id, String(index))}><td>{text(item.description ?? item.reference_id, "Transaction")}</td><td>{text(item.type ?? item.transaction_type)}</td><td>{money(item.amount)}</td><td>{date(item.created_at)}</td></tr>)}</tbody></table></div> : !error ? <p>No transactions yet.</p> : null}<Pager offset={offset} count={list.length} onPage={setOffset} /></section>{rider ? <Payouts /> : null}</div></Shell>;
}
