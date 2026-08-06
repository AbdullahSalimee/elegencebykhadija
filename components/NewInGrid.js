import ProductCard from '@/components/ProductCard';

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NewInGrid({ products }) {
  return (
    <div className="page-body" style={{ padding: '40px 48px 72px' }}>
      <div className="newin-grid">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            variant="newin"
            index={i}
            metaLine={`${formatDate(p.arrivedAt)} · ${p.fabric}`}
          />
        ))}
      </div>
    </div>
  );
}
