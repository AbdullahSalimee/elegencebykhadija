import { PRODUCTS } from '@/lib/products';
import { ORDERS, orderTotal } from '@/lib/orders';

export default function AdminDashboard() {
  const totalVariants = PRODUCTS.reduce((n, p) => n + p.colors.length, 0);
  const lowStock = PRODUCTS.flatMap((p) => p.colors.filter((c) => c.stock <= 3).map((c) => ({ product: p.name, color: c.label, stock: c.stock })));
  const pendingCod = ORDERS.filter((o) => o.payMethod === 'cod' && o.status === 'pending').length;
  const revenue = ORDERS.filter((o) => o.status !== 'returned').reduce((s, o) => s + orderTotal(o), 0);

  const cards = [
    { label: 'Products', value: PRODUCTS.length },
    { label: 'Variants', value: totalVariants },
    { label: 'Orders (all time, mock)', value: ORDERS.length },
    { label: 'Revenue (mock)', value: 'Rs. ' + revenue.toLocaleString() }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="card-meta">{c.label}</div>
            <div style={{ fontSize: 24, fontFamily: 'var(--font-heading)' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-title">Low stock (≤3 pieces)</div>
          {lowStock.length === 0 ? <div className="card-meta">Nothing low right now.</div> : (
            <table className="table">
              <thead><tr><th>Product</th><th>Colour</th><th>Left</th></tr></thead>
              <tbody>
                {lowStock.map((l, i) => (
                  <tr key={i}><td>{l.product}</td><td>{l.color}</td><td style={{ color: l.stock === 0 ? 'var(--color-accent-700)' : 'inherit' }}>{l.stock}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <div className="card-title">Cash on Delivery awaiting confirmation</div>
          <p className="card-meta" style={{ marginBottom: 8 }}>Call these customers before dispatch — COD has a real no-show cost.</p>
          <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)' }}>{pendingCod}</div>
        </div>
      </div>
    </div>
  );
}
