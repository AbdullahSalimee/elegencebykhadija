"use client";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/ProductCard";

// Selection lives here rather than in a prop: the homepage is a Server
// Component, and functions cannot cross that boundary into a client one.
// `select` is a plain string, so it serializes.
const SELECTORS = {
  all: (list) => list,
  new: (list) => [...list].sort((a, b) => b.arrivedAt.localeCompare(a.arrivedAt)),
  sale: (list) => list.filter((p) => p.compareAt && p.compareAt > p.price),
};

// A titled product row. `select` and `limit` let the homepage reuse it for
// "New In" and "On Sale" without a second component.
export default function ProductRail({
  title,
  href = "/shop",
  select = "all",
  limit = 6,
}) {
  const { openProduct } = useCart();
  const items = (SELECTORS[select] ?? SELECTORS.all)(PRODUCTS).slice(0, limit);
  if (!items.length) return null;

  return (
    <section className="eth-section">
      <div className="eth-section-head">
        <h2 className="eth-section-title">{title}</h2>
        <a className="eth-section-link" href={href}>
          View All
        </a>
      </div>

      <div className="eth-grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={openProduct} />
        ))}
      </div>
    </section>
  );
}
