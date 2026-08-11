import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { updateOrderStatus } from '@/lib/data/orders';
import { sendOrderStatusEmail } from '@/lib/email';

// PATCH — admin status change (pending -> confirmed -> dispatched -> delivered -> returned)
export async function PATCH(request, { params }) {
  const body = await request.json();
  if (!body?.status) return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  try {
    const order = await updateOrderStatus(params.id, body.status);
    revalidateTag('orders');
    if (order) await sendOrderStatusEmail(order);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
