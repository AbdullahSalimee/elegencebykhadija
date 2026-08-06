import ProductCard from '@/components/ProductCard';

export default function SaleGrid({ products }) {
  return (
    <div className="page-body" style={{ background: 'var(--color-neutral-900)', padding: '24px 48px 72px' }}>
      <div className="newin-grid">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            variant="sale"
            index={i}
            metaLine={`Save Rs. ${p.savings.toLocaleString()} · ${p.fabric}`}
          />
        ))}
      </div>
    </div>
  );
}
