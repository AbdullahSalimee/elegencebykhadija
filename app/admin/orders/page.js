"use client";
import { useState } from "react";
import { ORDERS as SEED, STATUSES, orderTotal } from "@/lib/orders";
import { Search, ChevronDown } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState(SEED);
  const [filter, setFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [query, setQuery] = useState("");

  const setStatus = (id, status) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const initials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");

  const visible = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (channelFilter === "all" || o.channel === channelFilter) &&
      (query === "" ||
        o.customer.toLowerCase().includes(query.toLowerCase()) ||
        o.id.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div>
      <div className="admin-page-eyebrow">Sales</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Orders</h1>
      <p style={{ opacity: 0.7, marginBottom: 20, maxWidth: "65ch" }}>
        Every order — placed on the website or entered manually from a WhatsApp
        chat — lands here so stock stays accurate across both channels. Confirm
        COD orders by phone before marking dispatched.
      </p>

      <div className="admin-filterbar">
        <div className="admin-search">
          <Search size={14} strokeWidth={1.8} style={{ opacity: 0.6 }} />
          <input
            placeholder="Search order # or customer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="admin-select-wrap">
          <select
            className="select-native"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        <div className="admin-select-wrap">
          <select
            className="select-native"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="all">All channels</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12.5, opacity: 0.6 }}>
          {visible.length} of {orders.length} orders
        </div>
      </div>

      <div className="panel orders-table-wrap" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Channel</th>
              <th>Payment</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.id}</div>
                  <div className="card-meta">{o.createdAt}</div>
                </td>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div className="row-avatar">{initials(o.customer)}</div>
                    <div>
                      <div style={{ fontSize: 13.5 }}>{o.customer}</div>
                      <div className="card-meta">{o.phone}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="tag tag-neutral">{o.channel}</span>
                </td>
                <td
                  style={{
                    textTransform: "uppercase",
                    fontSize: 11.5,
                    opacity: 0.75,
                  }}
                >
                  {o.payMethod}
                </td>
                <td className="num" style={{ fontWeight: 600 }}>
                  Rs. {orderTotal(o).toLocaleString()}
                </td>
                <td>
                  <div
                    className={`admin-select-wrap status-pill status-${o.status}`}
                    style={{ paddingRight: 4 }}
                  >
                    <span className="dot" />
                    <select
                      className="select-native status-select-native"
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="select-chevron" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="admin-empty">No orders match these filters.</div>
        )}
      </div>
    </div>
  );
}
