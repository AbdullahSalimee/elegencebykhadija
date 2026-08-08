"use client";
import { useCart } from "@/lib/cart-context";
import ProductPhoto from "@/components/ProductPhoto";

export default function SaleGrid({ products }) {
  const { openProduct } = useCart();
  return (
    <div
      className="page-body"
      style={{
        background: "var(--color-neutral-900)",
        padding: "24px 48px 72px",
      }}
    >
      <div className="newin-grid">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="card newin-card"
            style={{ cursor: "pointer", padding: 0, border: "none" }}
            onClick={() => openProduct(p.id)}
          >
            <div className="newin-photo-wrap">
              <ProductPhoto product={p} className="newin-photo" />
              <span className="sale-badge">{p.pct}% off</span>
              <span className="newin-num">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div style={{ padding: "10px 4px 2px" }}>
              <div className="newin-date" style={{ color: "var(--color-accent-300)" }}>
                Save Rs. {p.savings.toLocaleString()} · {p.fabric}
              </div>
              <div className="card-title newin-title" style={{ color: "#f7f2e9" }}>
                {p.name}
              </div>
              <div style={{ display: "flex", gap: 6, margin: "8px 0 10px" }}>
                {p.colors.map((c) => (
                  <span key={c.id} className="swatch" style={{ background: c.hex }} />
                ))}
              </div>
              <div
                style={{
                  fontSize: 15,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    textDecoration: "line-through",
                    opacity: 0.45,
                    fontSize: 13,
                    color: "#d8cfc0",
                  }}
                >
                  Rs. {p.compareAt.toLocaleString()}
                </span>
                <span
                  style={{
                    color: "var(--color-accent-300)",
                    fontWeight: 600,
                    marginLeft: "auto",
                  }}
                >
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
