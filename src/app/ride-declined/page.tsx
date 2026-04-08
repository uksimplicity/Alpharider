"use client";

import { useEffect } from "react";

export default function RideDeclinedPage() {
  useEffect(() => {
    localStorage.removeItem("alpharider_active_delivery_id");
  }, []);

  return (
    <div className="auth-page rider-dashboard-page">
      <div className="auth-card rider-card rider-dashboard-card">
        <div className="rider-details rider-confirm">
          <p className="confirm-title">RIDE DECLINED</p>
        </div>
      </div>
    </div>
  );
}
