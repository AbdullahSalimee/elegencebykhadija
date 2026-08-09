"use client";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/ProductCard";

export default function SaleGrid({ products }) {
  const { openProduct } = useCart();
  return (
    <div className="page-body eth-page-body">
      <div className="eth-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onOpen={openProduct}
            note={`Save Rs. ${p.savings.toLocaleString()} · ${p.fabric}`}
          />
        ))}
      </div>
    </div>
  );
}
