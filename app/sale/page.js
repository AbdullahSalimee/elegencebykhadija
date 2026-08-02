"use client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function SalePage() {
  const { openProduct } = useCart();
  const onSale = PRODUCTS.filter((p) => p.compareAt && p.compareAt > p.price)
    .map((p) => ({
      ...p,
      pct: Math.round(((p.compareAt - p.price) / p.compareAt) * 100),
      savings: p.compareAt - p.price,
    }))
    .sort((a, b) => b.pct - a.pct);

  const totalSavings = onSale.reduce((s, p) => s + p.savings, 0);

  return (
    <div>
      <Nav />

      <div
        style={{
          background: "var(--color-neutral-900)",
          color: "#efe9df",
          padding: "48px 48px 40px",
        }}
      >
        <div
          className="tag"
          style={{
            border: "1px solid var(--color-accent-300)",
            color: "var(--color-accent-300)",
            marginBottom: 16,
          }}
        >
          Limited colourways — while stock lasts
        </div>
        <h1 style={{ fontSize: 48, color: "#f7f2e9", maxWidth: "14ch" }}>
          Marked down, not compromised.
        </h1>
        <p style={{ maxWidth: "50ch", fontSize: 16, opacity: 0.82 }}>
          End-of-season pieces at their final price — same fabric, same
          stitching, no seconds.
          {onSale.length > 0 &&
            ` Right now: up to ${Math.max(...onSale.map((p) => p.pct))}% off across ${onSale.length} pieces.`}
        </p>
      </div>

      <div style={{ padding: "32px 48px 64px" }}>
        {onSale.length === 0 ? (
          <div className="admin-empty" style={{ padding: "80px 0" }}>
            Nothing on sale right now — check back soon.
          </div>
        ) : (
          <div className="sale-receipt">
            <div className="sale-receipt-head">
              <div>Piece</div>
              <div style={{ textAlign: "right" }}>Was</div>
              <div style={{ textAlign: "right" }}>Now</div>
              <div style={{ textAlign: "right" }}>You save</div>
              <div />
            </div>
            {onSale.map((p) => (
              <div
                key={p.id}
                className="sale-receipt-row"
                onClick={() => openProduct(p.id)}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  <div
                    className="plate ph"
                    style={{ width: 52, height: 52, flex: "none" }}
                  >
                    <span style={{ fontSize: 7 }}>{p.name}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {p.name}
                    </div>
                    <div className="card-meta">
                      {p.fabric} · {p.pieces}
                    </div>
                  </div>
                </div>
                <div
                  className="num"
                  style={{ textDecoration: "line-through", opacity: 0.5 }}
                >
                  Rs. {p.compareAt.toLocaleString()}
                </div>
                <div
                  className="num"
                  style={{ fontWeight: 700, color: "var(--color-accent-700)" }}
                >
                  Rs. {p.price.toLocaleString()}
                </div>
                <div className="num">
                  <span className="stock-chip low">
                    Rs. {p.savings.toLocaleString()} · {p.pct}%
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className="btn btn-secondary"
                    style={{ fontSize: 12.5, padding: "6px 12px" }}
                  >
                    View →
                  </span>
                </div>
              </div>
            ))}
            <div className="sale-receipt-total">
              <div>Total savings across all sale pieces</div>
              <div
                style={{ fontWeight: 700, color: "var(--color-accent-700)" }}
              >
                Rs. {totalSavings.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
