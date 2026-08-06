import { NextResponse } from 'next/server';
import { getOrderForTracking } from '@/lib/data/orders';

// POST { orderId, phone } — public order lookup for app/track. Requires the
// phone on file to match; returns the same generic 404 whether the order id
// or the phone was wrong, so this endpoint can't be used to enumerate orders.
export async function POST(request) {
  const body = await request.json();
  if (!body?.orderId || !body?.phone) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  try {
    const order = await getOrderForTracking(body.orderId.trim(), body.phone);
    if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
