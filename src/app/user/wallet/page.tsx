import Link from "next/link";
import MobilityShell from "@/app/components/MobilityShell";

export default function WalletPage() {
  return <MobilityShell>
    <Link className="mobility-back" href="/user/dashboard">← Back home</Link>
    <h1>Wallet</h1>
    <section className="mobility-panel mobility-empty">
      <p className="mobility-eyebrow">PAYMENTS</p>
      <h2>Your wallet is on its way.</h2>
      <p>Wallet balances, funding, and transaction history are not available yet. Confirm payment arrangements with your driver or delivery rider.</p>
      <Link className="mobility-button" href="/user/rides">Your rides</Link>
    </section>
  </MobilityShell>;
}
