import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// Server-only order data access. SWAP TARGET for the old lib/orders.js mock
// ORDERS array — keeps the same order shape (id, createdAt, customer, phone,
// channel, payMethod, status, lines[]) so the admin UI didn't need to change.

const ORDER_COLUMNS =
  'id,created_at,customer_name,phone,channel,pay_method,status,order_lines(product_name,color_label,qty,price)';

function mapOrder(row) {
  return {
    id: row.id,
    createdAt: row.created_at.slice(0, 10),
    customer: row.customer_name,
    phone: row.phone,
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
export async function placeOrder({ contact, payMethod, channel = 'website', lines }) {
  const db = supabaseServer();
  const { data, error } = await db.rpc('place_order', {
    payload: { contact, payMethod, channel, lines },
  });

  if (error) {
    const match = /out_of_stock:(\S+)/.exec(error.message || '');
    if (match) {
      const err = new Error('out_of_stock');
      err.code = 'out_of_stock';
      err.productId = match[1];
      throw err;
    }
    throw error;
  }

  return data; // { orderNumber, status }
}

export async function updateOrderStatus(id, status) {
  const db = supabaseServer();
  const { error } = await db.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}
