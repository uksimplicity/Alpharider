"use client";

import { useRouter } from "next/navigation";

export default function RideDeclineConfirmPage() {
  const router = useRouter();

  return (
    <div className="auth-page rider-dashboard-page">
      <div className="auth-card rider-card rider-dashboard-card">
        <div className="rider-details rider-confirm">
          <p className="confirm-title">
            ARE YOU SURE YOU WANT TO DECLINE THIS RIDE?
          </p>
          <div className="rider-details-actions">
            <button
              className="sheet-btn outline"
              type="button"
              onClick={() => router.back()}
            >
              No
            </button>
            <button
              className="sheet-btn primary"
              type="button"
              onClick={() => router.push("/ride-declined")}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
