import { NextResponse } from 'next/server';

// Order intake stub. Wire this up when the backend exists:
//   1. Open a DB transaction.
//   2. For each line, lock the variant row and check stock >= qty; if not, return 409
//      { error: 'out_of_stock', productId } so the client can tell the customer.
//   3. Decrement variant stock, insert the order + order_lines with status 'pending'
//      (state machine: pending -> confirmed -> dispatched -> delivered -> returned).
//   4. If payMethod === 'whatsapp', also fire a message/webhook so staff see it immediately.
//   5. Commit the transaction, return the generated order number.
// This same endpoint is also where a JazzCash/Easypaisa payment (once approved) would create the
// order as 'pending' and flip it to 'paid' only after verifying the gateway's server-to-server
// callback — never trust the client redirect alone.

export async function POST(request) {
  const body = await request.json();
  if (!body?.contact?.phone || !Array.isArray(body?.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }
  const orderNumber = Math.floor(10000 + Math.random() * 89999);
  return NextResponse.json({ orderNumber, status: 'pending' });
}
