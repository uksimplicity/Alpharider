"use client";

import Link from "next/link";
import { useBackend } from "@/lib/hooks/use-backend";
import { amount, money, text, unwrap, type Row } from "@/lib/backend-data";
import { riderStyles as styles } from "./RiderShell";
import { deliveryWalletCredits, expectedDeliveryCredit } from "@/lib/delivery-settlement";

export default function DeliverySettlement({ id, fee }: { id: string; fee: unknown }) {
  const commission = useBackend(`/rider/commissions/delivery/${encodeURIComponent(id)}`, 30000);
  const history = useBackend("/wallet/transactions?limit=100&offset=0", 30000);
  const balance = useBackend("/wallet/balance", 30000);
  const record = unwrap(commission.data);
  const commissionId = text(record.delivery_id ?? record.deliveryId);
  const commissionAmount = commissionId === id ? amount(record, ["commission_amt", "commission_amount"]) : null;
  const expected = expectedDeliveryCredit(fee, commissionAmount);
  let credits: Row[] = [];
  let historyError = history.error;
  try {
    if (history.data) credits = deliveryWalletCredits(history.data, id);
  } catch { historyError = "Wallet transactions could not be read."; }
  const refresh = () => { commission.refresh(); history.refresh(); balance.refresh(); };
  return <section className={styles.card} aria-label="Delivery payment">
    <h2>Delivery payment</h2>
    <p className={styles.muted}>Completion and wallet payment are separate. Check the records below for this delivery.</p>
    <div className={styles.grid}><p>Delivery fee: <strong>{money(fee)}</strong></p><p>Platform commission: <strong>{commission.loading ? "Checking…" : money(commissionAmount)}</strong></p><p>Wallet balance: <strong>{balance.loading ? "Checking…" : money(amount(balance.data))}</strong></p></div>
    {expected !== null ? <p>Expected credit after commission: <strong>{money(expected)}</strong>. Check the wallet transaction to confirm the amount received.</p> : null}
    {commission.error ? <p role="status">The commission for this delivery could not be loaded.</p> : null}
    {balance.error ? <p role="status">Your wallet balance could not be loaded.</p> : null}
    {history.loading ? <p>Checking recent wallet activity…</p> : historyError ? <p role="status">{historyError}</p> : credits.length ? <div><p>Recent wallet credits referencing this delivery:</p>{credits.map((credit, index) => <p key={text(credit.id, String(index))}><strong>{money(credit.amount)}</strong></p>)}</div> : <p>No matching credit was found in your 100 most recent wallet transactions. Check your wallet or contact support if the payment is missing.</p>}
    <div className={styles.actions}><button type="button" onClick={refresh}>Refresh payment details</button><Link href="/rider/wallet">View wallet</Link><Link href="/rider/earnings">View earnings</Link></div>
  </section>;
}
