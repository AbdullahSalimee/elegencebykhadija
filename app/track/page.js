"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { STATUSES, orderTotal } from "@/lib/orders";
import { PackageSearch, CheckCircle2 } from "lucide-react";

const STATUS_LABEL = {
  pending: "Order placed",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  returned: "Returned",
};

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackPage() {
  const [form, setForm] = useState({ orderId: "", phone: "" });
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | done

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const currentStepIndex = order ? STATUSES.indexOf(order.status) : -1;

  return (
    <div className="pg-track">
      <Nav />

      <div className="page-head" style={{ padding: "56px 48px 20px", maxWidth: 560 }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>
          Order tracking
        </div>
        <h1 style={{ fontSize: 44 }}>Where's my order?</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>
          Enter your order number and the phone number you checked out with.
        </p>
      </div>

      <div className="page-body" style={{ padding: "0 48px 64px", maxWidth: 560 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label>Order number</label>
            <input
              className="input"
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              placeholder="EK-10432"
              required
            />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03XX XXXXXXX"
              required
            />
          </div>
          <button className="btn btn-primary" disabled={status === "loading"} style={{ alignSelf: "flex-start" }}>
            {status === "loading" ? "Looking up…" : "Track order"}
          </button>
        </form>

        {status === "error" && (
          <div className="admin-empty panel" style={{ marginTop: 24 }}>
            We couldn't find an order with that number and phone combination.
            Double-check both and try again, or{" "}
            <a href="/contact">get in touch</a>.
          </div>
        )}

        {order && (
          <div className="panel" style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <PackageSearch size={18} strokeWidth={1.8} />
              <div className="panel-title" style={{ marginBottom: 0 }}>
                Hi {order.customer}, here's your order
              </div>
            </div>
            <p className="panel-sub">
              {order.id} · placed {order.createdAt}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "20px 0" }}>
              {STATUSES.filter((s) => s !== "returned" || order.status === "returned").map((s, i) => {
                const reached = currentStepIndex >= 0 && i <= currentStepIndex;
                const historyEntry = order.history.find((h) => h.status === s);
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle2
                      size={16}
                      strokeWidth={2}
                      style={{ opacity: reached ? 1 : 0.25, color: reached ? "var(--color-accent-700)" : "inherit" }}
                    />
                    <span style={{ opacity: reached ? 1 : 0.45, fontWeight: reached ? 600 : 400, fontSize: 14 }}>
                      {STATUS_LABEL[s]}
                    </span>
                    {historyEntry && (
                      <span style={{ fontSize: 12, opacity: 0.55, marginLeft: "auto" }}>
                        {formatDateTime(historyEntry.at)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hr" />
            <table className="admin-table">
              <tbody>
                {order.lines.map((l, i) => (
                  <tr key={i}>
                    <td>
                      {l.productName} <span style={{ opacity: 0.6 }}>· {l.color}</span> × {l.qty}
                    </td>
                    <td className="num">Rs. {(l.price * l.qty).toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight: 700 }}>Total</td>
                  <td className="num" style={{ fontWeight: 700 }}>
                    Rs. {orderTotal(order).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
