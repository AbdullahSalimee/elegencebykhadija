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
    <div className="pg-sale eth">
      <Nav />

      <div className="page-head eth-page-head">
        <div className="page-head-row eth-page-head-row">
          <div>
            <div className="eth-eyebrow eth-eyebrow-sale">The Sale</div>
            <h1 className="eth-page-title">Marked down, not compromised.</h1>
            <p className="eth-page-copy">
              End-of-season pieces at their final price — same fabric, same
              stitching, no seconds.
            </p>
          </div>
          <div className="page-head-aside eth-page-aside">
            <div className="eth-page-figure eth-page-figure-sale">
              up to {bestPct}%
            </div>
            off across {onSale.length} pieces
            <br />
            total savings Rs. {totalSavings.toLocaleString()}
          </div>
        </div>
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
