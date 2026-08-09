"use client";
import ProductPhoto from "@/components/ProductPhoto";

// The single article card for the whole storefront — homepage rails, shop,
// new in and sale all render this, so a change to the card is a change
// everywhere. `badge` overrides the automatic discount flag; `note` replaces
// the "fabric · pieces" line.
export default function ProductCard({ product: p, onOpen, badge, note }) {
  const off =
    p.compareAt && p.compareAt > p.price
      ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
      : null;
  const soldOut = !p.colors.some((c) => c.stock > 0);

  return (
    <article className="eth-card">
      <button
        className="eth-card-photo"
        onClick={() => onOpen(p.id)}
        aria-label={`Quick view — ${p.name}`}
      >
        <ProductPhoto product={p} className="eth-card-plate" />
        {badge ?? (off !== null && <span className="eth-badge">-{off}%</span>)}
        {soldOut && <span className="eth-badge eth-badge-out">Sold Out</span>}
        <span className="eth-card-quick">Quick View</span>
      </button>

      <div className="eth-card-body">
        <div className="eth-card-swatches">
          {p.colors.map((c) => (
            <span
              key={c.id}
              className="swatch"
              style={{ background: c.hex }}
              title={c.label}
            />
          ))}
        </div>
        <h3 className="eth-card-name">{p.name}</h3>
        <div className="eth-card-meta">
          {note ?? `${p.fabric} · ${p.pieces}`}
        </div>
        <div className="eth-card-price">
          {p.compareAt && (
            <span className="eth-price-was">
              Rs. {p.compareAt.toLocaleString()}
            </span>
          )}
          <span className="eth-price-now">Rs. {p.price.toLocaleString()}</span>
        </div>
      </div>
    </article>
  );
}
