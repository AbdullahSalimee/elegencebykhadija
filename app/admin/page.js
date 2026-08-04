"use client";
import { PRODUCTS } from "@/lib/products";
import { ORDERS, STATUSES, orderTotal } from "@/lib/orders";
import { Wallet, ClipboardList, TrendingUp, TriangleAlert } from "lucide-react";

const STATUS_COLOR = {
  pending: "#b68235",
  confirmed: "#3f5d43",
  dispatched: "#2f3b57",
  delivered: "#3a270d",
  returned: "#8f2f3a",
};

// Group orders by day for a simple revenue trend (mock data only spans a few dates).
function revenueByDay(orders) {
  const map = {};
  orders.forEach((o) => {
    if (o.status === "returned") return;
    map[o.createdAt] = (map[o.createdAt] || 0) + orderTotal(o);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

function topProducts(orders) {
  const map = {};
  orders.forEach((o) => {
    if (o.status === "returned") return;
    o.lines.forEach((l) => {
      map[l.productName] = (map[l.productName] || 0) + l.qty * l.price;
    });
  });
  return Object.entries(map).sort(([, a], [, b]) => b - a);
}

export default function AdminDashboard() {
  const revenue = ORDERS.filter((o) => o.status !== "returned").reduce(
    (s, o) => s + orderTotal(o),
    0,
  );
  const avgOrder = Math.round(
    revenue / Math.max(1, ORDERS.filter((o) => o.status !== "returned").length),
  );
  const returnedCount = ORDERS.filter((o) => o.status === "returned").length;
  const returnRate = Math.round((returnedCount / ORDERS.length) * 100);

  const trend = revenueByDay(ORDERS);
  const maxDay = Math.max(...trend.map(([, v]) => v), 1);

  const statusCounts = STATUSES.map((s) => ({
    status: s,
    count: ORDERS.filter((o) => o.status === s).length,
  }));
  const maxStatus = Math.max(...statusCounts.map((s) => s.count), 1);

  const channelCounts = {
    website: ORDERS.filter((o) => o.channel === "website").length,
    whatsapp: ORDERS.filter((o) => o.channel === "whatsapp").length,
  };
  const totalChannel = channelCounts.website + channelCounts.whatsapp;

  const top = topProducts(ORDERS);

  const cards = [
    {
      label: "Revenue, all time",
      value: "Rs. " + revenue.toLocaleString(),
      icon: Wallet,
      delta: "Excludes returned orders",
      deltaClass: "flat",
    },
    {
      label: "Avg. order value",
      value: "Rs. " + avgOrder.toLocaleString(),
      icon: TrendingUp,
      delta: `Across ${ORDERS.length} orders`,
      deltaClass: "flat",
    },
    {
      label: "Orders, all time",
      value: ORDERS.length,
      icon: ClipboardList,
      delta: `${statusCounts.find((s) => s.status === "pending")?.count || 0} pending`,
      deltaClass: "down",
    },
    {
      label: "Return rate",
      value: `${returnRate}%`,
      icon: TriangleAlert,
      delta: `${returnedCount} returned`,
      deltaClass: returnRate > 15 ? "down" : "flat",
    },
  ];

  return (
    <div>
      <div className="admin-page-eyebrow">Analytics</div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Dashboard</h1>

      <div className="stat-grid">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="stat-card">
              <div className="stat-icon">
                <Icon size={16} strokeWidth={2} />
              </div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
              <div className={`stat-delta ${c.deltaClass}`}>{c.delta}</div>
            </div>
          );
        })}
      </div>

      <div
        className="admin-split"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Revenue by day</div>
          </div>
          <p className="panel-sub">
            Confirmed, dispatched and delivered orders — returned orders
            excluded.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              height: 160,
              padding: "4px 4px 16px",
            }}
          >
            {trend.map(([day, value]) => (
              <div
                key={day}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontVariantNumeric: "tabular-nums",
                    opacity: 0.7,
                  }}
                >
                  {Math.round(value / 1000)}k
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 40,
                    height: `${Math.max(6, (value / maxDay) * 110)}px`,
                    background:
                      "linear-gradient(180deg, var(--color-accent), var(--color-accent-700))",
                    borderRadius: "4px 4px 2px 2px",
                  }}
                />
                <div style={{ fontSize: 10.5, opacity: 0.55 }}>
                  {day.slice(5)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Orders by status</div>
          </div>
          <p className="panel-sub">
            Where every order currently sits in the pipeline.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingBottom: 16,
            }}
          >
            {statusCounts.map((s) => (
              <div
                key={s.status}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 78,
                    fontSize: 12,
                    textTransform: "capitalize",
                    opacity: 0.75,
                  }}
                >
                  {s.status}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "var(--color-neutral-200)",
                    borderRadius: 3,
                    height: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(s.count / maxStatus) * 100}%`,
                      height: "100%",
                      background: STATUS_COLOR[s.status],
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 18,
                    fontSize: 12,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="admin-split" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}
      >
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Top products by revenue</div>
          </div>
          <p className="panel-sub">
            Ranked by revenue from confirmed and beyond, this period.
          </p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: "right" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {top.map(([name, value]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    Rs. {value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Orders by channel</div>
          </div>
          <p className="panel-sub">
            Website checkout vs. manually-entered WhatsApp orders.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingBottom: 16,
            }}
          >
            {Object.entries(channelCounts).map(([channel, count]) => (
              <div key={channel}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ textTransform: "capitalize" }}>{channel}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {count} · {Math.round((count / totalChannel) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--color-neutral-200)",
                    borderRadius: 3,
                    height: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(count / totalChannel) * 100}%`,
                      height: "100%",
                      background: "var(--color-accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
