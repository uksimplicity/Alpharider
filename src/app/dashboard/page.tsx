"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPendingDeliveries } from "@/lib/deliveries-api";
import { getRiderProfile } from "@/lib/rider-api";
import { clearAuthSession } from "@/lib/session";

function formatDate(value: Date) {
  return value.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const toDisplayName = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const firstName =
    (typeof record.first_name === "string" && record.first_name.trim()) ||
    (typeof record.firstName === "string" && record.firstName.trim()) ||
    "";
  const lastName =
    (typeof record.last_name === "string" && record.last_name.trim()) ||
    (typeof record.lastName === "string" && record.lastName.trim()) ||
    "";
  const directName =
    (typeof record.name === "string" && record.name.trim()) ||
    (typeof record.username === "string" && record.username.trim()) ||
    (typeof record.full_name === "string" && record.full_name.trim()) ||
    "";

  if (firstName || lastName) {
    if (firstName && /^user$/i.test(lastName)) {
      return firstName;
    }
    return `${firstName} ${lastName}`.trim();
  }
  if (directName) return directName;

  const nested = record.user ?? record.profile ?? record.data;
  return toDisplayName(nested);
};

const fromEmailPrefix = (value: string) => {
  const prefix = value.split("@")[0]?.trim();
  if (!prefix) return "";
  return `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}`;
};

const normalizeDisplayName = (value: string) => {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (/^\S+\s+User$/i.test(cleaned)) {
    return cleaned.replace(/\s+User$/i, "");
  }
  return cleaned;
};

const isNotFoundError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("404") || message.includes("not found");
};

export default function DashboardPage() {
  const currentDate = formatDate(new Date());
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [rideRequests, setRideRequests] = useState<
    Array<{
      id: string;
      from: string;
      to: string;
    }>
  >([]);
  const balance = "NGN 42,800";

  useEffect(() => {
    const storedName = localStorage.getItem("alpharider_display_name");
    if (storedName?.trim()) {
      setDisplayName(normalizeDisplayName(storedName));
    } else {
      const storedUsername = localStorage.getItem("alpharider_username");
      if (storedUsername?.trim()) {
        setDisplayName(normalizeDisplayName(storedUsername));
      } else {
        const storedEmail = localStorage.getItem("alpharider_email");
        const fallbackName = storedEmail ? fromEmailPrefix(storedEmail) : "";
        if (fallbackName) {
          setDisplayName(fallbackName);
        }
      }
    }

    const loadPendingDeliveries = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setRequestError("");
        setIsLoadingRequests(false);
        return;
      }

      setIsLoadingRequests(true);
      setRequestError("");

      try {
        const deliveries = await getPendingDeliveries(token, 20);
        try {
          const profile = await getRiderProfile(token);
          const profileName = toDisplayName(profile);
          if (profileName) {
            const normalizedName = normalizeDisplayName(profileName);
            setDisplayName(normalizedName);
            localStorage.setItem("alpharider_display_name", normalizedName);
          }
        } catch {
          // Keep dashboard usable even if profile endpoint is unavailable.
        }
        const mapped = deliveries.map((item, index) => ({
          id: item.id ?? item.delivery_id ?? item.order_id ?? `delivery-${index}`,
          from: item.pickup_address ?? "Pickup address unavailable",
          to: item.dropoff_address ?? "Dropoff address unavailable",
        }));
        setRideRequests(mapped);
      } catch (error) {
        if (isNotFoundError(error)) {
          setRideRequests([]);
          setRequestError("");
          return;
        }
        setRequestError(
          error instanceof Error
            ? error.message
            : "Unable to load pending rides right now."
        );
      } finally {
        setIsLoadingRequests(false);
      }
    };

    void loadPendingDeliveries();
  }, []);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!profileMenuRef.current?.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const rideRequestContent = useMemo(() => {
    if (isLoadingRequests) {
      return <p className="helper">Loading ride requests...</p>;
    }

    if (requestError) {
      return (
        <p className="helper danger" role="alert">
          {requestError}
        </p>
      );
    }

    if (rideRequests.length === 0) {
      return <p className="helper">No pending ride requests for now.</p>;
    }

    return (
      <div className="rider-request-list">
        {rideRequests.map((request) => (
          <button
            className="rider-request-card rider-request-action"
            type="button"
            onClick={() => router.push(`/delivery/request?id=${request.id}`)}
            key={request.id}
          >
            <div className="route-line">
              <span className="route-dot" />
              <span>{request.from}</span>
            </div>
            <div className="route-line">
              <span className="route-pin" />
              <span>{request.to}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }, [isLoadingRequests, requestError, rideRequests, router]);

  return (
    <div className="auth-page rider-dashboard-page">
      <div className="auth-card rider-card rider-dashboard-card">
        <div className="rider-dashboard">
          <header className="rider-topbar">
            <div className="rider-profile-menu-wrap" ref={profileMenuRef}>
              <button
                className="rider-avatar-trigger"
                type="button"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <img
                  className="rider-avatar"
                  src="/icons/user.svg"
                  alt={displayName || "User"}
                />
              </button>
              {isProfileMenuOpen ? (
                <div className="rider-profile-menu" role="menu">
                  <button
                    className="rider-profile-menu-item"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      clearAuthSession();
                      router.push("/auth/login");
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
            <img className="rider-logo" src="/logo.png" alt="AlphaRide" />
            <button
              className="rider-bell"
              type="button"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          <div className="rider-greeting">
            <span className="rider-date">{currentDate}</span>
            <h1>{displayName ? `Hello, ${displayName}!` : "Hello!"}</h1>
          </div>

          <section className="balance-card">
            <span className="balance-label">
              Total Balance
              <button
                className="balance-toggle"
                type="button"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
                onClick={() => setShowBalance((prev) => !prev)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M1.5 12s4-6.5 10.5-6.5S22.5 12 22.5 12s-4 6.5-10.5 6.5S1.5 12 1.5 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  {showBalance ? (
                    <path
                      d="M4 4l16 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  ) : null}
                </svg>
              </button>
            </span>
            <span className="balance-amount">
              {showBalance ? balance : "****"}
            </span>
          </section>

          <section className="rider-section">
            <h2>Delivery Request</h2>
            {rideRequestContent}
          </section>

          <section className="rider-section">
            <h2>Scheduled Delivery</h2>
            <p className="helper">No scheduled delivery for now.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
