import Link from "next/link";

export default function RiderPage() {
  return (
    <div className="shell">
      <header className="shell-header">
        <h1>Rider Hub</h1>
        <p>Everything you need before going online.</p>
      </header>

      <div className="card-grid">
        <div className="card">
          <h2>Shift status</h2>
          <p className="metric">Offline</p>
          <p className="subtext">Go online when you are ready.</p>
        </div>
        <div className="card">
          <h2>Next payout</h2>
          <p className="metric">NGN 18,500</p>
          <p className="subtext">Scheduled for Friday</p>
        </div>
        <div className="card">
          <h2>Support</h2>
          <p className="metric">24/7</p>
          <p className="subtext">Chat with rider care anytime.</p>
        </div>
      </div>

      <Link className="text-link" href="/dashboard">
        Go to dashboard
      </Link>
    </div>
  );
}
