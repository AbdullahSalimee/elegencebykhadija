'use client';
import { useState } from 'react';
import { ORDERS as SEED, STATUSES, orderTotal } from '@/lib/orders';

const STATUS_COLOR = {
  pending: 'var(--color-accent-700)', confirmed: '#3f5d43', dispatched: '#2f3b57',
  delivered: '#3a270d', returned: '#8f2f3a'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(SEED);
  const [filter, setFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  const setStatus = (id, status) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));

  const visible = orders.filter((o) =>
    (filter === 'all' || o.status === filter) &&
    (channelFilter === 'all' || o.channel === channelFilter)
  );

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Orders</h1>
      <p style={{ opacity: .7, marginBottom: 20, maxWidth: '65ch' }}>
        Every order — placed on the website or entered manually from a WhatsApp chat — lands here so
        stock stays accurate across both channels. Confirm COD orders by phone before marking dispatched.
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="seg">
          <label className="seg-opt"><input type="radio" checked={filter === 'all'} onChange={() => setFilter('all')} />All statuses</label>
          {STATUSES.map((s) => (
            <label key={s} className="seg-opt"><input type="radio" checked={filter === s} onChange={() => setFilter(s)} />{s}</label>
          ))}
        </div>
        <div className="seg">
          <label className="seg-opt"><input type="radio" checked={channelFilter === 'all'} onChange={() => setChannelFilter('all')} />All channels</label>
          <label className="seg-opt"><input type="radio" checked={channelFilter === 'website'} onChange={() => setChannelFilter('website')} />Website</label>
          <label className="seg-opt"><input type="radio" checked={channelFilter === 'whatsapp'} onChange={() => setChannelFilter('whatsapp')} />WhatsApp</label>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Channel</th><th>Payment</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {visible.map((o) => (
            <tr key={o.id}>
              <td>{o.id}<div className="card-meta">{o.createdAt}</div></td>
              <td>{o.customer}<div className="card-meta">{o.phone}</div></td>
              <td><span className="tag tag-neutral">{o.channel}</span></td>
              <td style={{ textTransform: 'uppercase', fontSize: 12 }}>{o.payMethod}</td>
              <td>Rs. {orderTotal(o).toLocaleString()}</td>
              <td>
                <select className="input" style={{ color: STATUS_COLOR[o.status], fontWeight: 600 }}
                  value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
