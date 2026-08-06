import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { updateCategory, deleteCategory } from '@/lib/data/site-config';

export async function PATCH(request, { params }) {
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
  try {
    await deleteCategory(params.id);
    revalidateTag('site-config');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
