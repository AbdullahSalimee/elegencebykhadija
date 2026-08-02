import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid var(--color-divider)', padding: 24 }}>
        <div className="nav-brand" style={{ marginBottom: 24, fontSize: 16 }}>ELEGANCE <span style={{ opacity: .55, fontStyle: 'italic' }}>admin</span></div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/admin" style={{ padding: '8px 10px', borderRadius: 4, fontSize: 14 }}>Dashboard</Link>
          <Link href="/admin/products" style={{ padding: '8px 10px', borderRadius: 4, fontSize: 14 }}>Products &amp; Stock</Link>
          <Link href="/admin/orders" style={{ padding: '8px 10px', borderRadius: 4, fontSize: 14 }}>Orders</Link>
          <Link href="/" style={{ padding: '8px 10px', borderRadius: 4, fontSize: 14, opacity: .6, marginTop: 16 }}>← Back to storefront</Link>
        </nav>
      </aside>
      <main style={{ padding: 40 }}>{children}</main>
    </div>
  );
}
