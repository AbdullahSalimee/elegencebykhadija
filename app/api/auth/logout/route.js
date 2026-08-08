import { NextResponse } from 'next/server';
import { endSession } from '@/lib/auth';

// POST — drops the session row and clears the cookie, so this device is logged
// out everywhere it matters. Other devices keep their own sessions.
export async function POST() {
  await endSession();
  return NextResponse.json({ ok: true });
}
