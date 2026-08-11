import { NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { getOrdersForCustomer } from '@/lib/data/orders';

// GET — the logged-in customer's own orders, each with its status timeline.
// The customer id comes from the session cookie and never from the request
// body, so there's no id to tamper with to read someone else's orders.
export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = await getSessionCustomer();
  if (!customer) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

  try {
    const orders = await getOrdersForCustomer(customer.id);
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
