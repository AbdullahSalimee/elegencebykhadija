import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { updateCategory, deleteCategory } from '@/lib/data/site-config';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  try {
    await updateCategory(params.id, body.label);
    revalidateTag('site-config');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await deleteCategory(params.id);
    revalidateTag('site-config');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
