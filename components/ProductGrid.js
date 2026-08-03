'use client';
import { PRODUCTS } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

export default function ProductGrid() {
  const { openProduct } = useCart();
  return (
    <div id="products-anchor" style={{ padding: '56px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28 }}>Unstitched Suits</h2>
        <a href="/shop" style={{ fontSize: 13 }}>View all →</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
        {PRODUCTS.slice(0, 6).map((p) => (
          <div key={p.id} className="card" style={{ cursor: 'pointer', padding: 0, border: 'none' }} onClick={() => openProduct(p.id)}>
            <div className="plate ph" style={{ height: 260 }}><span>{p.name} — product photo</span></div>
            <div style={{ padding: '6px 2px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {p.colors.map((c) => <span key={c.id} className="swatch" style={{ background: c.hex }} />)}
              </div>
              <div className="card-title">{p.name}</div>
              <div className="card-meta">{p.fabric} · {p.pieces}</div>
              <div style={{ marginTop: 6, fontSize: 15 }}>
                {p.compareAt && <span style={{ textDecoration: 'line-through', opacity: .5, marginRight: 8 }}>Rs. {p.compareAt.toLocaleString()}</span>}
                <span style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>Rs. {p.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
