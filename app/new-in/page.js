import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewInGrid from "@/components/NewInGrid";
import { PRODUCTS } from "@/lib/products";

export const metadata = { title: "New In — Elegance by Khadija" };

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewInPage() {
  const sorted = [...PRODUCTS].sort((a, b) =>
    b.arrivedAt.localeCompare(a.arrivedAt),
  );

  return (
    <div className="pg-new eth">
      <Nav />

      <div className="page-head eth-page-head">
        <div className="page-head-row eth-page-head-row">
          <div>
            <div className="eth-eyebrow">New Arrivals</div>
            <h1 className="eth-page-title">Fresh off the loom.</h1>
            <p className="eth-page-copy">
              The newest pieces to land in the studio — newest first. Once a
              colourway sells out, it doesn't come back.
            </p>
          </div>
          <div className="page-head-aside eth-page-aside">
            <div className="eth-page-figure">{sorted.length}</div>
            pieces this drop
            <br />
            as of {formatDate(sorted[0]?.arrivedAt)}
          </div>
        </div>
      </div>

      <NewInGrid products={sorted} />

      <Footer />
    </div>
  );
}
