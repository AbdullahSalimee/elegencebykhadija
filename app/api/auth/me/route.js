import { NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';

// GET — who is logged in on this device? Backs hooks/useSession.js, which the
// nav and checkout read. Never 401s: "nobody" is a perfectly normal answer.
export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = await getSessionCustomer();
  return NextResponse.json({ customer });
}
