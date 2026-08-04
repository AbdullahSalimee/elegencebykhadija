"use client";
import { useCart } from "@/lib/cart-context";

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NewInGrid({ products }) {
  const { openProduct } = useCart();
  return (
    <div className="page-body" style={{ padding: "40px 48px 72px" }}>
      <div className="newin-grid">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="card newin-card"
            style={{ cursor: "pointer", padding: 0, border: "none" }}
            onClick={() => openProduct(p.id)}
          >
            <div className="newin-photo-wrap">
              <div className="plate ph newin-photo">
                <span>{p.name} — product photo</span>
              </div>
              <span className="newin-badge">New</span>
              <span className="newin-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              {p.compareAt && p.compareAt > p.price && (
                <span className="newin-sale">Sale</span>
              )}
            </div>
            <div style={{ padding: "10px 4px 2px" }}>
              <div className="newin-date">
                {formatDate(p.arrivedAt)} · {p.fabric}
              </div>
              <div className="card-title newin-title">{p.name}</div>
              <div style={{ display: "flex", gap: 6, margin: "8px 0 10px" }}>
                {p.colors.map((c) => (
                  <span key={c.id} className="swatch" style={{ background: c.hex }} />
                ))}
              </div>
              <div style={{ fontSize: 15, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                {p.compareAt && (
                  <span style={{ textDecoration: "line-through", opacity: 0.45, fontSize: 13 }}>
                    Rs. {p.compareAt.toLocaleString()}
                  </span>
                )}
                <span style={{ color: "var(--color-accent-700)", fontWeight: 600, marginLeft: "auto" }}>
                  Rs. {p.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
