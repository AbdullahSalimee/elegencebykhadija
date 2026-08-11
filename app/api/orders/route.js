import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getOrders, placeOrder, getOrderById } from '@/lib/data/orders';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { getSessionCustomer } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-auth';
import { updateCustomer } from '@/lib/data/customers';

// GET — admin order list (app/admin/orders/page.js via useOrders()).
// Admin-only: this returns every customer's name, phone, email and address.
// A customer reading their own orders uses /api/account/orders instead.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

// POST — order intake. Requires a logged-in customer: the checkout modal
// creates the account from the details being typed (POST /api/auth/signup)
// before it ever gets here, so this is never a dead end for a first-time
// buyer — but it does mean every order is attached to an account that can
// track it afterwards.
//
// Name/phone/email come from the account, not the request body: a customer
// can't place an order under someone else's identity by editing the payload.
// Only the delivery address is per-order.
//
// Runs inside a single DB transaction (place_order() in supabase/auth.sql):
// locks each variant, checks stock, decrements it, inserts the order as
// 'pending'. Returns 409 out_of_stock if any line can't be fulfilled —
// nothing is written in that case.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  const customer = await getSessionCustomer();
  if (!customer) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }
  if (!Array.isArray(body?.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }

  const address = (body.address || '').trim() || customer.address;

  try {
    const result = await placeOrder({
      contact: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address,
      },
      payMethod: body.payMethod,
      customerId: customer.id,
      lines: body.lines,
    });

    revalidateTag('orders');
    revalidateTag('products'); // stock just changed

    // Remember the address for next time's checkout prefill. Best-effort:
    // failing to save a convenience field must not fail a placed order.
    if (address && address !== customer.address) {
      await updateCustomer(customer.id, { address }).catch(() => {});
    }

    // Best-effort — a customer with no email or an unconfigured email
    // provider must never block the order response.
    const order = await getOrderById(result.orderNumber).catch(() => null);
    if (order) await sendOrderConfirmationEmail(order);

    return NextResponse.json(result);
  } catch (err) {
    if (err.code === 'out_of_stock') {
      return NextResponse.json({ error: 'out_of_stock', productId: err.productId }, { status: 409 });
    }
    if (err.code === 'unavailable_item') {
      return NextResponse.json({ error: 'unavailable_item' }, { status: 409 });
    }
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
