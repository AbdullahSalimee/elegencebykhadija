import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getOrders, placeOrder } from '@/lib/data/orders';

// GET — admin order list (app/admin/orders/page.js via useOrders())
export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

// POST — order intake. Runs inside a single DB transaction (see place_order()
// in supabase/migrations/0001_init.sql): locks each variant, checks stock,
// decrements it, inserts the order as 'pending'. Returns 409 out_of_stock if
// any line can't be fulfilled — nothing is written in that case.
export async function POST(request) {
  const body = await request.json();
  if (!body?.contact?.phone || !Array.isArray(body?.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }

  try {
    const result = await placeOrder({
      contact: body.contact,
      payMethod: body.payMethod,
      channel: body.channel || 'website',
      lines: body.lines,
    });
    revalidateTag('orders');
    revalidateTag('products'); // stock just changed
    return NextResponse.json(result);
  } catch (err) {
    if (err.code === 'out_of_stock') {
      return NextResponse.json({ error: 'out_of_stock', productId: err.productId }, { status: 409 });
    }
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
