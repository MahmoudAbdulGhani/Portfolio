import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiLoader, FiLock, FiLogIn } from "react-icons/fi";
import { PageMeta } from "../../components/PageMeta";
import { Logo } from "../../components/Logo";
import { isAuthenticated, saveSession } from "../../lib/admin-session";
import { useLogin } from "../../lib/hooks";

export function Login() {
  const [email, setEmail] = useState("Mahmoud.Abdulghani@outlook.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter an email and password.");
      return;
    }
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: ({ token, admin }) => {
          saveSession({ token, admin });
          navigate("/admin/dashboard", { replace: true });
        },
        onError: (err) => setError(err.message),
      },
    );
  };

  return (
    <>
      <PageMeta title="Admin login" />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo showLabel={false} />
            <div>
              <h1 className="heading">Admin console</h1>
              <p className="mt-2 text-sm text-muted">
                Sign in to manage projects, messages and settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5 p-6 shadow-card-lg sm:p-8">
            <div>
              <label htmlFor="admin-email" className="field-label">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="field-label">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-center gap-2 text-sm font-semibold text-danger"
              >
                <FiLock size={14} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="btn-primary w-full"
            >
              {login.isPending ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <FiLogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
