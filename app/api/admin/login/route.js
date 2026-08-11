import { NextResponse } from 'next/server';
import { verifyAdminPassword, startAdminSession } from '@/lib/admin-auth';

// Not reachable through the middleware guard (it exempts /api/admin/*) — this
// is how a session is obtained in the first place.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  try {
    if (!verifyAdminPassword(body?.password)) {
      // Deliberately vague and identical for every failure: there's one
      // account, so "wrong password" and "no password sent" are the same fact.
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }
    await startAdminSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Thrown when ADMIN_PASSWORD or ADMIN_SESSION_SECRET is unset — a
    // deployment problem, not a bad password, and worth saying plainly.
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
