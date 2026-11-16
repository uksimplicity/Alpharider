import Link from "next/link";

export default function DeliveryReviewError({ id, error, status, retry, className }: {
  id: string; error: string; status?: number; retry: () => void; className?: string;
}) {
  return <section className={className}>
    <p role="alert">Couldn’t open this delivery. Refresh requests or return to the dashboard.</p>
    <div><button onClick={retry}>Try again</button> <Link href="/dashboard">Return to dashboard</Link></div>
    <details><summary>Error details</summary><p>Delivery ID: {id}</p>
      {status !== undefined ? <p>HTTP status: {status}</p> : null}<p>Server message: {error}</p>
    </details>
  </section>;
}
