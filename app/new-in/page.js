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
    <div className="pg-new">
      <Nav />

      <div className="page-head" style={{ padding: "64px 48px 8px" }}>
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
              className="tag tag-outline"
              style={{
                marginBottom: 16,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              New Arrivals
            </div>
            <h1 style={{ fontSize: 52, maxWidth: "16ch", margin: 0 }}>
              Fresh off the loom.
            </h1>
            <p
              style={{
                maxWidth: "50ch",
                fontSize: 16,
                opacity: 0.75,
                margin: "14px 0 0",
              }}
            >
              The newest pieces to land in the studio — newest first. Once a
              colourway sells out, it doesn't come back.
            </p>
          </div>
          <div
            className="page-head-aside"
            style={{
              textAlign: "right",
              fontSize: 13,
              opacity: 0.6,
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                color: "var(--color-accent-700)",
                lineHeight: 1,
              }}
            >
              {sorted.length}
            </div>
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
