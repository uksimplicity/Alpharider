import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="shell">
      <header className="shell-header">
        <h1>Auth</h1>
        <p>Select how you want to continue.</p>
      </header>

      <div className="card-grid">
        <Link className="card-link" href="/auth/login">
          <h2>Login</h2>
          <p>Access your rider account and resume your shift.</p>
        </Link>
        <Link className="card-link" href="/auth/signup">
          <h2>Sign up</h2>
          <p>Create a new rider profile in minutes.</p>
        </Link>
      </div>

      <Link className="text-link" href="/">
        Back to home
      </Link>
    </div>
  );
}
