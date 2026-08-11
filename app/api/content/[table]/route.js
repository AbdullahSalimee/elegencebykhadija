import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import {
  listContent,
  upsertContent,
  listChildLinks,
  createChildLink,
} from '@/lib/data/content';

// Admin CRUD for the storefront content tables (app/admin/content).
//
// One dynamic route for ten tables rather than ten near-identical folders:
// they all share the same {id, ...fields, sort_order} shape, and the table
// name is validated against the allow-lists in lib/data/content.js before it
// reaches the database — an unknown table throws there rather than being
// queried.
//
// Server Components read through lib/data/content.js directly; this exists for
// the admin panels, which are client components.
//
// Admin-only, enforced twice: middleware.js blocks /api/content/* outright,
// and requireAdmin() below catches anything that slips past a future change to
// the matcher.

// The two parent/child link tables. Their primary key is a bigserial the admin
// never supplies, so they take a different path to the flat tables above.
const LINK_TABLES = new Set(['footer_links', 'nav_column_links']);

export async function GET(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { table } = params;
  const columnId = new URL(request.url).searchParams.get('columnId');

  try {
    if (LINK_TABLES.has(table)) {
      if (!columnId) {
        return NextResponse.json({ error: 'columnId_required' }, { status: 400 });
      }
      return NextResponse.json({ rows: await listChildLinks(table, columnId) });
    }
    return NextResponse.json({ rows: await listContent(table) });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { table } = params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    if (LINK_TABLES.has(table)) {
      if (!body.column_id || !body.label) {
        return NextResponse.json({ error: 'invalid_link' }, { status: 400 });
      }
      const row = await createChildLink(table, body);
      revalidateTag('site-content');
      return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
    }

    if (!body.id) {
      return NextResponse.json({ error: 'id_required' }, { status: 400 });
    }
    // upsert, not insert: the admin panels save a whole row on edit, and
    // re-saving an existing id should update it rather than fail on the key.
    await upsertContent(table, body);
    revalidateTag('site-content');
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    // An unknown table name lands here as a thrown Error from lib/data/content.
    const unknown = /^unknown (content|link) table/.test(err.message);
    return NextResponse.json(
      { error: unknown ? 'unknown_table' : 'server_error', message: err.message },
      { status: unknown ? 404 : 500 }
    );
  }
}
