"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// The admin console's front door. Deliberately plain — no storefront chrome,
// since Nav and Footer would pull the whole shop's data into a page that
// exists only to take a password.

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where the middleware was taking them before it stopped them. Only relative
  // paths are honoured, so a crafted ?next=https://… can't turn this form into
  // an open redirect.
  const nextPath = searchParams.get("next");
  const target =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // refresh() so the server re-renders the admin layout with the new
        // cookie in place; push() alone can serve a cached signed-out shell.
        router.replace(target);
        router.refresh();
        return;
      }
      const info = await res.json().catch(() => ({}));
      setError(
        res.status === 401
          ? "That password isn't right."
          : info.message || "Something went wrong. Please try again.",
      );
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <form className="panel admin-login-panel" onSubmit={submit}>
        <div className="panel-title">Elegance by Khadija</div>
        <p className="panel-sub" style={{ marginBottom: 18 }}>
          Sign in to manage the shop.
        </p>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            className="input"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12.5, color: "#8f2f3a", marginTop: 8 }}>{error}</div>
        )}

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={busy || !password}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <a
          href="/"
          style={{ fontSize: 12, opacity: 0.6, marginTop: 14, textAlign: "center" }}
        >
          Back to the shop
        </a>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  // useSearchParams needs a Suspense boundary to keep the route statically
  // renderable rather than forcing the whole page dynamic.
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
