"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userCategory, setUserCategory] = useState("");

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit =
    isEmailValid && password.trim().length > 0 && userCategory.length > 0;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Log in and pick up right where you left
        </p>

        <form className="auth-form">
          <label>
            Email
            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              <img className="icon-img" src="/icons/lock.svg" alt="Lock" />
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
                <img
                  className="icon-img"
                  src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                  alt=""
                />
              </button>
            </div>
          </label>

          <div className="auth-meta">
            <Link href="#">Forgot Password?</Link>
          </div>

          <button
            className={`auth-submit ${canSubmit ? "active" : ""}`}
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              if (canSubmit) {
                router.push(
                  userCategory === "user" ? "/user/dashboard" : "/dashboard"
                );
              }
            }}
          >
            Log In
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link href="/auth/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
