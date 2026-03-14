"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsFloating(window.scrollY > 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`top-nav${isFloating ? " is-floating" : ""}`}>
      <div className="logo">
        <img src="/logo.png" alt="AlphaRide" />
      </div>
      <nav className="nav-links">
        <Link href="#">Home</Link>
        <Link href="#">Track Package</Link>
      </nav>
      <div className="nav-actions">
        <Link className="link" href="/auth/login">
          Login
        </Link>
        <Link className="button primary" href="/auth/signup">
          Sign Up
        </Link>
      </div>
    </header>
  );
}
