"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "@/lib/auth-api";
import { getRiderProfile } from "@/lib/rider-api";
import { getUserProfile } from "@/lib/user-api";

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

const normalizeDisplayName = (value: string) => {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (/^\S+\s+User$/i.test(cleaned)) {
    return cleaned.replace(/\s+User$/i, "");
  }
  return cleaned;
};

const toAccessToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const directToken =
    (typeof record.token === "string" && record.token.trim()) ||
    (typeof record.access_token === "string" && record.access_token.trim()) ||
    (typeof record.accessToken === "string" && record.accessToken.trim()) ||
    "";
  if (directToken) return directToken;

  const nested = record.user ?? record.profile ?? record.data ?? record.result;
  return toAccessToken(nested);
};

const fromEmailPrefix = (value: string) => {
  const prefix = value.split("@")[0]?.trim();
  if (!prefix) return "";
  return `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}`;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedIdentifier = identifier.trim();
  const isEmailLogin = /\S+@\S+\.\S+/.test(trimmedIdentifier);
  const isPhoneLogin = /^\d{7,15}$/.test(trimmedIdentifier);
  const canSubmit =
    (isEmailLogin || isPhoneLogin) &&
    password.trim().length > 0 &&
    userCategory.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginUser(
        isPhoneLogin
          ? { phone: trimmedIdentifier, password }
          : { email: trimmedIdentifier, password }
      );

      if (response.requiresVerification === true) {
        if (isEmailLogin) {
          localStorage.setItem("alpharider_pending_email", trimmedIdentifier);
        }
        localStorage.setItem("alpharider_is_verified", "false");
        setErrorMessage("Please verify your account before logging in.");
        router.push("/auth/verify");
        return;
      }

      const token = toAccessToken(response);
      if (!token) {
        setErrorMessage("Login succeeded but no access token was returned.");
        return;
      }
      localStorage.setItem("alpharider_token", token);
      localStorage.setItem("alpharider_last_activity_at", String(Date.now()));
      localStorage.setItem("alpharider_is_verified", "true");
      if (isEmailLogin) {
        localStorage.setItem("alpharider_email", trimmedIdentifier);
      }

      let displayName =
        toDisplayName(response) ||
        (isEmailLogin ? fromEmailPrefix(trimmedIdentifier) : "");
      try {
        const profile =
          userCategory === "user"
            ? await getUserProfile(token)
            : await getRiderProfile(token);
        displayName = toDisplayName(profile) || displayName;
      } catch {
        // Keep login successful even when profile endpoint is unavailable.
      }

      if (displayName) {
        localStorage.setItem(
          "alpharider_display_name",
          normalizeDisplayName(displayName)
        );
      }

      router.push(userCategory === "user" ? "/user/dashboard" : "/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to log in right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src="/logo.png" alt="AlphaRide" width={160} height={48} priority />
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Log in and pick up right where you left
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email or Phone Number
            <div className="input-group">
              <input
                type="text"
                placeholder="Email address or phone number"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>
          </label>

          <label>
            User Category
            <div className="input-group">
              <select
                value={userCategory}
                onChange={(event) => setUserCategory(event.target.value)}
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="rider">Rider</option>
                <option value="user">User</option>
              </select>
            </div>
          </label>

          <label>
            Password
            <div className="input-group">
              <Image
                className="icon-img"
                src="/icons/lock.svg"
                alt="Lock"
                width={20}
                height={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Image
                  className="icon-img"
                  src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </label>

          <div className="auth-meta">
            <Link href="/auth/forgot-password">Forgot Password?</Link>
          </div>

          <button
            className={`auth-submit ${canSubmit && !isLoading ? "active" : ""}`}
            type="submit"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
          {errorMessage ? (
            <span className="helper danger" role="alert">
              {errorMessage}
            </span>
          ) : null}
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link href="/auth/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
