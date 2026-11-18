"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signupUser } from "@/lib/services";
import { signupPasswordCriteria, signupValidationMessage } from "@/lib/signup-validation";

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submissionLock = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => { if (errorMessage) errorRef.current?.focus(); }, [errorMessage]);

  const criteria = signupPasswordCriteria(password);
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;
    const validationMessage = signupValidationMessage({ name, email, phone, password, confirmPassword, userCategory, acceptedTerms });
    if (validationMessage) {
      setErrorMessage(validationMessage);
      errorRef.current?.focus();
      return;
    }

    submissionLock.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [firstNameRaw, ...lastNameParts] = name.trim().split(/\s+/);
      const firstName = firstNameRaw ?? "";
      const lastName = lastNameParts.join(" ");
      const role = userCategory === "rider" ? "rider" : "rider_app_customer";

      const response = await signupUser({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      localStorage.setItem("alpharider_pending_email", email.trim());
      localStorage.setItem("alpharider_pending_phone", phone);
      localStorage.setItem("alpharider_is_verified", "false");

      if (response.requiresVerification === false) {
        router.push("/auth/login");
        return;
      }

      router.push("/auth/verify");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign up right now."
      );
      submissionLock.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src="/logo.png" alt="AlphaRide" width={160} height={48} priority />
        </div>
        <h1>Let’s Get started</h1>
        <p className="auth-subtitle">
          Sign up to start enjoying stress-free rides
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
          <label>
            Your Name
            <div className="input-group">
              <Image
                className="icon-img"
                src="/icons/user.svg"
                alt="User"
                width={20}
                height={20}
              />
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
                required
                autoComplete="tel"
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
              <Image
                className="icon-img"
                src="/icons/lock.svg"
                alt="Lock"
                width={20}
                height={20}
              />
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
                <Image
                  className="icon-img"
                  src={showConfirmPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                  alt=""
                  width={20}
                  height={20}
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

          {errorMessage ? (
            <p className="helper danger" role="alert" ref={errorRef} tabIndex={-1}>
              {errorMessage}
            </p>
          ) : null}
          <button
            className={`auth-submit ${!isLoading ? "active" : ""}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/auth/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

