import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductRow from "@/components/ProductRow";
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

  // Group consecutive products by arrival date for the log-entry headers.
  const groups = [];
  sorted.forEach((p) => {
    const last = groups[groups.length - 1];
    if (last && last.date === p.arrivedAt) last.items.push(p);
    else groups.push({ date: p.arrivedAt, items: [p] });
  });

  return (
    <div>
      <Nav />

      <div style={{ padding: "56px 48px 20px" }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>
          Arrivals Log
        </div>
        <h1 style={{ fontSize: 48, maxWidth: "16ch" }}>
          What just came off the loom.
        </h1>
        <p style={{ maxWidth: "52ch", fontSize: 16, opacity: 0.8 }}>
          Every piece here landed in the last few weeks — logged the day it
          arrived, newest first. Once a colourway sells out, it doesn't come
          back.
        </p>
      </div>

      <div style={{ padding: "8px 48px 64px", position: "relative" }}>
        <div className="arrivals-spine" />
        {groups.map((g) => (
          <div key={g.date} className="arrivals-group">
            <div className="arrivals-date">
              <span className="arrivals-dot" />
              {formatDate(g.date)}
            </div>
            <div className="arrivals-items">
              {g.items.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
