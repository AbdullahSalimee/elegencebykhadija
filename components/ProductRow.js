"use client";
import { useCart } from "@/lib/cart-context";
import ProductPhoto from "@/components/ProductPhoto";

export default function ProductRow({ product: p }) {
  const { openProduct } = useCart();
  return (
    <div className="product-row" onClick={() => openProduct(p.id)}>
      <ProductPhoto product={p} className="product-row-photo" sizes="140px" />
      <div className="product-row-body">
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {p.colors.map((c) => (
            <span key={c.id} className="swatch" style={{ background: c.hex }} />
          ))}
        </div>
        <div className="card-title" style={{ fontSize: 20 }}>
          {p.name}
        </div>
        <div className="card-meta">
          {p.fabric} · {p.pieces}
        </div>
        <div style={{ marginTop: 10, fontSize: 16 }}>
          {p.compareAt && (
            <span
              style={{
                textDecoration: "line-through",
                opacity: 0.5,
                marginRight: 8,
              }}
            >
              Rs. {p.compareAt.toLocaleString()}
            </span>
          )}
          <span style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>
            Rs. {p.price.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="product-row-cta">
        <span className="btn btn-secondary">View piece →</span>
      </div>
    </div>
  );
}
