// Shared order constants/helpers. The mock ORDERS array moved to the database —
// see lib/data/orders.js (server) and hooks/useOrders.js (client).

export const STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'returned'];

export function orderTotal(order) {
  return order.lines.reduce((s, l) => s + l.price * l.qty, 0);
}
