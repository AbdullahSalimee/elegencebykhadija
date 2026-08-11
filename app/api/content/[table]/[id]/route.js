import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import {
  upsertContent,
  deleteContent,
  updateChildLink,
  deleteChildLink,
} from '@/lib/data/content';

// Per-row edit and delete for the storefront content tables.
// See ../route.js for why one dynamic route serves all of them.

const LINK_TABLES = new Set(['footer_links', 'nav_column_links']);

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { table, id } = params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    if (LINK_TABLES.has(table)) {
      await updateChildLink(table, id, body);
    } else {
      // The id comes from the URL, never the body — so a PATCH can't rename a
      // row onto a different primary key and silently create a second one.
      await upsertContent(table, { ...body, id });
    }
    revalidateTag('site-content');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const unknown = /^unknown (content|link) table/.test(err.message);
    return NextResponse.json(
      { error: unknown ? 'unknown_table' : 'server_error', message: err.message },
      { status: unknown ? 404 : 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { table, id } = params;

  try {
    if (LINK_TABLES.has(table)) {
      await deleteChildLink(table, id);
    } else {
      // Child rows go with the parent: nav_columns and footer_columns are
      // declared `on delete cascade`, so removing a column takes its links.
      await deleteContent(table, id);
    }
    revalidateTag('site-content');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const unknown = /^unknown (content|link) table/.test(err.message);
    return NextResponse.json(
      { error: unknown ? 'unknown_table' : 'server_error', message: err.message },
      { status: unknown ? 404 : 500 }
    );
  }
}
