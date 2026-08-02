'use client';
import { useState } from 'react';
import { PRODUCTS as SEED } from '@/lib/products';

// Client-side only (no persistence) — wire onSave to PATCH /api/products/[id]/variants/[colorId]
// once the backend exists, updating the variant row inside the same table stock lives on.
export default function AdminProducts() {
  const [products, setProducts] = useState(SEED);

  const updateStock = (productId, colorId, value) => {
    setProducts((prev) => prev.map((p) => p.id !== productId ? p : {
      ...p, colors: p.colors.map((c) => c.id !== colorId ? c : { ...c, stock: Math.max(0, Number(value) || 0) })
    }));
  };
  const updatePrice = (productId, value) => {
    setProducts((prev) => prev.map((p) => p.id !== productId ? p : { ...p, price: Math.max(0, Number(value) || 0) }));
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Products &amp; Stock</h1>
      <p style={{ opacity: .7, marginBottom: 24, maxWidth: '60ch' }}>
        Stock lives on the variant (colourway), not the product — two customers can't oversell the
        same one-of-a-kind colour. Edits here are local to this session; connect to a real API to persist.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {products.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">{p.name}</div>
                <div className="card-meta">{p.fabric} · {p.pieces}</div>
              </div>
              <div className="field" style={{ width: 140 }}>
                <label>Price (Rs.)</label>
                <input className="input" type="number" value={p.price} onChange={(e) => updatePrice(p.id, e.target.value)} />
              </div>
            </div>
            <table className="table">
              <thead><tr><th>Colourway</th><th>Stock</th></tr></thead>
              <tbody>
                {p.colors.map((c) => (
                  <tr key={c.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="swatch" style={{ width: 14, height: 14, background: c.hex }} />{c.label}
                    </td>
                    <td>
                      <input className="input" style={{ width: 90 }} type="number" min="0" value={c.stock}
                        onChange={(e) => updateStock(p.id, c.id, e.target.value)} />
                      {c.stock === 0 && <span className="tag tag-neutral" style={{ marginLeft: 8 }}>Out of stock</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
