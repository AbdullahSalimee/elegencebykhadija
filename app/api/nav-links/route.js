import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getNavLinks, createNavLink } from '@/lib/data/site-config';

export async function GET() {
  try {
    const navLinks = await getNavLinks();
    return NextResponse.json({ navLinks });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  if (!body?.id || !body?.label) {
    return NextResponse.json({ error: 'invalid_nav_link' }, { status: 400 });
  }
  try {
    await createNavLink(body);
    revalidateTag('site-config');
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
