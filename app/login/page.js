"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useSession, apiLogin, apiSignup } from "@/hooks/useSession";

// Log in / create an account outside of checkout. Most customers never see
// this page — they get an account automatically the first time they order —
// but it's how you get back in on a new phone, or after logging out.
export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, customer, mutate } = useSession();

  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await apiLogin(form.phone, form.password);
      } else {
        await apiSignup(form);
      }
      await mutate();
      router.push("/track");
    } catch (err) {
      if (mode === "login") {
        setError("That phone number and password don't match an account.");
      } else if (err.status === 409) {
        setMode("login");
        setError("This number already has an account — log in instead.");
      } else if (err.info?.error === "weak_password") {
        setError("Choose a password of at least 6 characters.");
      } else if (err.info?.error === "invalid_phone") {
        setError("Enter a valid phone number, e.g. 0300 1234567.");
      } else if (err.info?.error === "name_required") {
        setError("Please enter your name.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pg-track">
      <Nav />

      <div className="page-head" style={{ padding: "56px 48px 20px", maxWidth: 460 }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>Your account</div>
        <h1 style={{ fontSize: 44 }}>{mode === "login" ? "Welcome back" : "Create an account"}</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>
          {mode === "login"
            ? "Log in with the phone number you order with, and you'll stay signed in on this device."
            : "Your phone number and a password — that's all it takes to follow your orders."}
        </p>
      </div>

      <div className="page-body" style={{ padding: "0 48px 64px", maxWidth: 460 }}>
        {isLoggedIn ? (
          <div className="panel">
            <div className="panel-title">You're logged in as {customer.name}</div>
            <p className="panel-sub">{customer.phone}</p>
            <a className="btn btn-primary" href="/track" style={{ marginTop: 8 }}>View my orders</a>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div className="field">
                <label>Full name</label>
                <input className="input" value={form.name} onChange={set("name")} placeholder="Khadija Fatima" required />
              </div>
            )}

            <div className="field">
              <label>Phone number</label>
              <input className="input" value={form.phone} onChange={set("phone")} placeholder="03XX XXXXXXX" required />
            </div>

            {mode === "signup" && (
              <div className="field">
                <label>Email (optional — for order updates)</label>
                <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </div>
            )}

            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                required
              />
            </div>

            {error && <div style={{ fontSize: 13, color: "#8f2f3a" }}>{error}</div>}

            <button className="btn btn-primary" disabled={busy} style={{ alignSelf: "flex-start" }}>
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>

            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {mode === "login" ? "First time ordering with us? " : "Already have an account? "}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              >
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
