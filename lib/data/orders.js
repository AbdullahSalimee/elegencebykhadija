import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// Server-only order data access. SWAP TARGET for the old lib/orders.js mock
// ORDERS array — keeps the same order shape (id, createdAt, customer, phone,
// channel, payMethod, status, lines[]) so the admin UI didn't need to change.

const ORDER_COLUMNS =
  'id,created_at,customer_name,phone,customer_email,channel,pay_method,status,order_lines(product_name,color_label,qty,price)';

function mapOrder(row) {
  return {
    id: row.id,
    createdAt: row.created_at.slice(0, 10),
    customer: row.customer_name,
    phone: row.phone,
    email: row.customer_email || null,
    channel: row.channel,
    payMethod: row.pay_method,
    status: row.status,
    lines: (row.order_lines || []).map((l) => ({
      productName: l.product_name,
      color: l.color_label,
      qty: l.qty,
      price: Number(l.price),
    })),
  };
}

async function fetchOrders() {
  const db = supabaseServer();
  const { data, error } = await db
    .from('orders')
    .select(ORDER_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrder);
}

export const getOrders = unstable_cache(fetchOrders, ['orders-list'], {
  tags: ['orders'],
  revalidate: 60,
});

// Places an order atomically via the place_order() Postgres function (see
// supabase/migrations/0001_init.sql): locks each variant, checks stock,
// decrements it, and inserts the order + lines in one transaction. Throws
// an Error with `.code = 'out_of_stock'` and `.productId` set so the API
// route can turn it into the 409 the client already expects.
export async function placeOrder({ contact, payMethod, customerId, lines }) {
  const db = supabaseServer();
  const { data, error } = await db.rpc('place_order', {
    payload: { contact, payMethod, customerId, lines },
  });

  if (error) {
    const message = error.message || '';

    const outOfStock = /out_of_stock:(\S+)/.exec(message);
    if (outOfStock) {
      const err = new Error('out_of_stock');
      err.code = 'out_of_stock';
      err.productId = outOfStock[1];
      throw err;
    }

    // A cart line pointing at a product or colourway that no longer exists —
    // a cart saved before the catalogue changed, or an item deleted in admin.
    // Typed so the customer gets "no longer available" instead of a 500.
    if (/unknown variant/.test(message)) {
      const err = new Error('unavailable_item');
      err.code = 'unavailable_item';
      throw err;
    }

    throw error;
  }

  return data; // { orderNumber, status }
}

// Returns the full order (with line items + a plain updated-status echo) so
// the caller (the PATCH route) has what it needs for a follow-up email
// without a second round trip.
export async function updateOrderStatus(id, status) {
  const db = supabaseServer();
  const { data, error } = await db
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select(ORDER_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data) : null;
}

// Internal lookup (not exposed by any public route) — used right after
// placeOrder() to build the confirmation email. Customer-facing reads go
// through getOrdersForCustomer(), which is scoped to the session's account.
export async function getOrderById(id) {
  const db = supabaseServer();
  const { data, error } = await db.from('orders').select(ORDER_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data) : null;
}

// Every order belonging to one logged-in customer, newest first, each with its
// full status timeline. This is order tracking now: the customer is already
// identified by their session cookie, so there's nothing to look up and no
// order-number-plus-phone form to get wrong.
export async function getOrdersForCustomer(customerId) {
  const db = supabaseServer();
  const { data, error } = await db
    .from('orders')
    .select(`${ORDER_COLUMNS},address,order_status_history(status,created_at)`)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((row) => ({
    ...mapOrder(row),
    address: row.address || null,
    history: (row.order_status_history || [])
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((h) => ({ status: h.status, at: h.created_at })),
  }));
}
