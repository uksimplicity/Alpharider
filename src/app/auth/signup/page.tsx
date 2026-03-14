"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const criteria = useMemo(() => {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const minLength = password.length >= 8;
    return [
      { label: "At least 8 characters", met: minLength },
      { label: "Includes a letter", met: hasLetter },
      { label: "Includes a number", met: hasNumber },
      { label: "Includes a special character", met: hasSpecial },
    ];
  }, [password]);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const allCriteriaMet = criteria.every((item) => item.met);
  const canSubmit =
    name.trim() &&
    isEmailValid &&
    phone.trim() &&
    allCriteriaMet &&
    isPasswordMatch &&
    userCategory &&
    acceptedTerms;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>Let’s Get started</h1>
        <p className="auth-subtitle">
          Sign up to start enjoying stress-free rides
        </p>

        <form className="auth-form">
          <label>
            Your Name
            <div className="input-group">
              <img className="icon-img" src="/icons/user.svg" alt="User" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </label>

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
            Phone Number
            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                pattern="[0-9]*"
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
            <ul className="criteria-list">
              {criteria.map((item) => (
                <li key={item.label} className={item.met ? "met" : ""}>
                  <span className="criteria-dot" />
                  {item.label}
                </li>
              ))}
            </ul>
          </label>

          <label>
            Confirm Password
            <div className="input-group">
              <img className="icon-img" src="/icons/lock.svg" alt="Lock" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <img
                  className="icon-img"
                  src={showConfirmPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                  alt=""
                />
              </button>
            </div>
            <span className={`helper ${isPasswordMatch ? "met" : ""}`}>
              Must match with above password
            </span>
          </label>

          <label className="terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />
            <span>
              I agree to the <Link href="#">Terms &amp; Conditions</Link>
            </span>
          </label>

          <button
            className={`auth-submit ${canSubmit ? "active" : ""}`}
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              if (canSubmit) {
                router.push("/auth/verify");
              }
            }}
          >
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/auth/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
