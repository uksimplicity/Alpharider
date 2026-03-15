"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth-api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit =
    isEmailValid && password.trim().length > 0 && userCategory.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginUser({
        email,
        password,
      });

      const token = response.token ?? response.accessToken ?? response.access_token;
      if (token) {
        localStorage.setItem("alpharider_token", token);
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
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Log in and pick up right where you left
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
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
