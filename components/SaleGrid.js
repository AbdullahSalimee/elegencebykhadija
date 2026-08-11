import ProductCard from "@/components/ProductCard";

export default function SaleGrid({ products }) {
  return (
    <div className="page-body eth-page-body">
      <div className="eth-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            note={`Save Rs. ${p.savings.toLocaleString()} · ${p.fabric}`}
          />
        ))}
      </div>
    </div>
  );
}
