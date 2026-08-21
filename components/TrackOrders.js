"use client";
import { useEffect } from "react";
import { STATUSES, orderTotal } from "@/lib/orders";
import { useSession, useMyOrders } from "@/hooks/useSession";
import { useOrderUpdates } from "@/hooks/useOrderUpdates";
import { PackageSearch, CheckCircle2 } from "lucide-react";

// The stateful half of /track — kept out of the page so the page can stay a
// Server Component and render Nav and Footer, which read the database.
//
// The heading is in here too: it greets the customer by name, so it depends on
// the session the same way the list below it does.

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

function OrderCard({ order }) {
  const currentStepIndex = STATUSES.indexOf(order.status);

  return (
    <div className="panel" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <PackageSearch size={18} strokeWidth={1.8} />
        <div className="panel-title" style={{ marginBottom: 0 }}>{order.id}</div>
        <span className={`status-pill status-${order.status}`} style={{ marginLeft: "auto", fontSize: 12 }}>
          <span className="dot" /> {STATUS_LABEL[order.status] || order.status}
        </span>
      </div>
      <p className="panel-sub">
        Placed {order.createdAt} · {order.payMethod === "cod" ? "Cash on Delivery" : order.payMethod}
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
            <td className="num" style={{ fontWeight: 700 }}>Rs. {orderTotal(order).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {order.address && (
        <p className="panel-sub" style={{ marginTop: 12 }}>Delivering to: {order.address}</p>
      )}
    </div>
  );
}

export default function TrackOrders() {
  const { customer } = useSession();
  const { orders, isLoading, needsLogin } = useMyOrders();
  const { markAllSeen } = useOrderUpdates();

  // Looking at the orders is what "reading" the update means — clear the nav
  // badge once they're actually on screen.
  useEffect(() => {
    if (orders.length > 0) markAllSeen();
  }, [orders, markAllSeen]);

  return (
    <>
      <div className="page-head" style={{ padding: "56px 48px 20px", maxWidth: 620 }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>Order tracking</div>
        <h1 style={{ fontSize: 44 }}>
          {customer ? `Your orders, ${customer.name.split(" ")[0]}` : "Where's my order?"}
        </h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>
          {customer
            ? "Every order you've placed with us, and exactly where each one has got to."
            : "Log in with the phone number you ordered with to follow your orders."}
        </p>
      </div>

      <div className="page-body" style={{ padding: "0 48px 64px", maxWidth: 620 }}>
        {needsLogin ? (
          <div className="panel">
            <div className="panel-title">You're not logged in</div>
            <p className="panel-sub">
              Your orders live in your account. Log in with your phone number and password to see them.
            </p>
            <a className="btn btn-primary" href="/login" style={{ marginTop: 8 }}>Log in</a>
          </div>
        ) : isLoading ? (
          <div className="admin-empty panel">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty panel">
            No orders yet. <a href="/shop">Browse the collection</a> — everything you order will appear here.
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </>
  );
}
