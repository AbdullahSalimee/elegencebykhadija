import { NextResponse } from 'next/server';
import { hashPassword, normalizePhone, isValidPhone, startSession } from '@/lib/auth';
import { createCustomer, linkCustomerOrders } from '@/lib/data/customers';

// POST { name, phone, password, email?, address? }
//
// This is the account-creation half of checkout: the details a customer types
// to place an order ARE their login. On success the session cookie is set, so
// the very next call (POST /api/orders) already knows who they are.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  const name = (body.name || '').trim();
  const phone = normalizePhone(body.phone);
  const password = body.password || '';

  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });
  if (!isValidPhone(phone)) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'weak_password' }, { status: 400 });

  try {
    const customer = await createCustomer({
      phone,
      name,
      email: (body.email || '').trim() || null,
      address: (body.address || '').trim() || null,
      passwordHash: hashPassword(password),
    });

    // Orders placed with this number before the account existed become visible
    // immediately — including one placed moments ago as a guest.
    await linkCustomerOrders(customer.id, phone).catch(() => 0);
    await startSession(customer.id);

    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    if (err.code === 'phone_taken') {
      return NextResponse.json({ error: 'phone_taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
