"use client";

import { useRouter } from "next/navigation";

const transactions = [
  { title: "Delivery payment", amount: "+N1,500", time: "Today 12:05" },
  { title: "Wallet funding", amount: "+N5,000", time: "Yesterday 08:15" },
  { title: "Delivery charge", amount: "-N800", time: "Yesterday 07:40" },
];

export default function WalletPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card wallet-card">
        <header className="user-page-header">
          <button
            className="user-header-button"
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <img className="user-header-logo" src="/logo.png" alt="AlphaRide" />
          <span className="user-header-spacer" />
        </header>

        <h1 className="user-page-title">Wallet</h1>

        <section className="wallet-balance">
          <p>Total Balance</p>
          <h2>N3,454.00</h2>
          <button className="user-primary-button" type="button">
            Fund Wallet
          </button>
        </section>

        <section className="wallet-transactions">
          <h2>Recent Transactions</h2>
          <div className="wallet-list">
            {transactions.map((item, index) => (
              <div className="wallet-item" key={`${item.title}-${index}`}>
                <div>
                  <p>{item.title}</p>
                  <span>{item.time}</span>
                </div>
                <strong>{item.amount}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
