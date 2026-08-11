import ProductCard from "@/components/ProductCard";

// A titled product row. Products are fetched by the Server Component that
// renders it and passed in — selection and limit are applied server-side by
// the caller's getProducts() query, so this stays a plain server component.
export default function ProductRail({ title, href = "/shop", products = [] }) {
  const items = products;
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
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
