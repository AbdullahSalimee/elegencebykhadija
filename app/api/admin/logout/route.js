import { NextResponse } from 'next/server';
import { endAdminSession } from '@/lib/admin-auth';

export async function POST() {
  endAdminSession();
  return NextResponse.json({ ok: true });
}
