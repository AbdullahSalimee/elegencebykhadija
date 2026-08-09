"use client";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/ProductCard";

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NewInGrid({ products }) {
  const { openProduct } = useCart();
  return (
    <div className="page-body eth-page-body">
      <div className="eth-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onOpen={openProduct}
            badge={<span className="eth-badge eth-badge-new">New</span>}
            note={`${formatDate(p.arrivedAt)} · ${p.fabric}`}
          />
        ))}
      </div>
    </div>
  );
}
