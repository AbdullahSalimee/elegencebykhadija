import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SaleGrid from "@/components/SaleGrid";
import { PRODUCTS } from "@/lib/products";

export const metadata = { title: "Sale — Elegance by Khadija" };

export default function SalePage() {
  const onSale = PRODUCTS.filter((p) => p.compareAt && p.compareAt > p.price)
    .map((p) => ({
      ...p,
      pct: Math.round(((p.compareAt - p.price) / p.compareAt) * 100),
      savings: p.compareAt - p.price,
    }))
    .sort((a, b) => b.pct - a.pct);

  const totalSavings = onSale.reduce((s, p) => s + p.savings, 0);
  const bestPct = onSale.length > 0 ? Math.max(...onSale.map((p) => p.pct)) : 0;

  return (
    <div className="pg-sale">
      <Nav />

      <div
        className="page-head"
        style={{
          background: "var(--color-neutral-900)",
          color: "#efe9df",
          padding: "64px 48px 8px",
        }}
      >
        <div
          className="page-head-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              className="tag"
              style={{
                border: "1px solid var(--color-accent-300)",
                color: "var(--color-accent-300)",
                marginBottom: 16,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              The Sale
            </div>
            <h1
              style={{
                fontSize: 52,
                color: "#f7f2e9",
                maxWidth: "16ch",
                margin: 0,
              }}
            >
              Marked down, not compromised.
            </h1>
            <p
              style={{
                maxWidth: "50ch",
                fontSize: 16,
                opacity: 0.82,
                margin: "14px 0 0",
              }}
            >
              End-of-season pieces at their final price — same fabric, same
              stitching, no seconds.
            </p>
          </div>
          <div
            className="page-head-aside"
            style={{
              textAlign: "right",
              fontSize: 13,
              opacity: 0.75,
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                color: "var(--color-accent-300)",
                lineHeight: 1,
              }}
            >
              up to {bestPct}%
            </div>
            off across {onSale.length} pieces
            <br />
            total savings Rs. {totalSavings.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--color-neutral-900)", paddingBottom: 8 }}>
        <div className="hr section-rule" style={{ margin: "0 48px", background: "rgba(239,233,223,.14)" }} />
      </div>

      {onSale.length === 0 ? (
        <div className="admin-empty" style={{ padding: "80px 0" }}>
          Nothing on sale right now — check back soon.
        </div>
      ) : (
        <SaleGrid products={onSale} />
      )}

      <Footer />
    </div>
  );
}
