// Mock order data + the order status state machine.
// SWAP for real data once the backend exists: getOrders() from your DB, ordered by createdAt desc.

export const STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'returned'];

export const ORDERS = [
  { id: 'EK-10432', createdAt: '2026-08-01', customer: 'Ayesha Raza', phone: '0301 2345678', channel: 'website', payMethod: 'cod', status: 'pending',
    lines: [{ productName: 'Zarnaab', color: 'Emerald Vine', qty: 1, price: 6200 }] },
  { id: 'EK-10431', createdAt: '2026-08-01', customer: 'Mahnoor Khan', phone: '0333 1122334', channel: 'whatsapp', payMethod: 'whatsapp', status: 'confirmed',
    lines: [{ productName: 'Sana', color: 'Onyx Floral', qty: 1, price: 9200 }, { productName: 'Iqra', color: 'Sage', qty: 1, price: 4950 }] },
  { id: 'EK-10428', createdAt: '2026-07-30', customer: 'Sadia Malik', phone: '0345 9988776', channel: 'website', payMethod: 'cod', status: 'dispatched',
    lines: [{ productName: 'Anaya', color: 'Indigo Bloom', qty: 2, price: 5400 }] },
  { id: 'EK-10420', createdAt: '2026-07-27', customer: 'Fatima Noor', phone: '0312 4455667', channel: 'website', payMethod: 'cod', status: 'delivered',
    lines: [{ productName: 'Meherbano', color: 'Pine', qty: 1, price: 6750 }] },
  { id: 'EK-10415', createdAt: '2026-07-24', customer: 'Zara Ahmed', phone: '0300 7788990', channel: 'whatsapp', payMethod: 'whatsapp', status: 'returned',
    lines: [{ productName: 'Rania', color: 'Ink', qty: 1, price: 8900 }] }
];

export function orderTotal(order) {
  return order.lines.reduce((s, l) => s + l.price * l.qty, 0);
}
