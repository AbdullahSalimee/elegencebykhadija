import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getCategories, createCategory } from '@/lib/data/site-config';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  if (!body?.id || !body?.label) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 });
  }
  try {
    await createCategory(body);
    revalidateTag('site-config');
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
