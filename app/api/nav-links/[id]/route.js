import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { updateNavLink, deleteNavLink } from '@/lib/data/site-config';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  try {
    await updateNavLink(params.id, body);
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
    await deleteNavLink(params.id);
    revalidateTag('site-config');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
