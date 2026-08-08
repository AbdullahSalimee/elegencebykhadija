import { NextResponse } from 'next/server';
import { verifyPassword, normalizePhone, startSession } from '@/lib/auth';
import { getCustomerByPhone } from '@/lib/data/customers';

// POST { phone, password }
//
// Same generic 401 whether the number is unknown or the password is wrong —
// otherwise this endpoint answers "does this person shop here?" for anyone
// who asks.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(body.phone);
  const password = body.password || '';

  if (!phone || !password) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  try {
    const found = await getCustomerByPhone(phone);
    if (!found || !verifyPassword(password, found.passwordHash)) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    await startSession(found.customer.id);
    return NextResponse.json({ customer: found.customer });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
