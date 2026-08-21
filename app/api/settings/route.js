import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { readSiteSettings, saveSiteSettings } from '@/lib/data/settings';

// The shop's own details (app/admin/shop). Server Components read
// lib/data/settings.js directly; this exists for the admin form, which is a
// client component and can't import server-only code.
//
// Admin-only both ways: middleware.js blocks /api/settings outright, and
// requireAdmin() below catches anything a future change to the matcher lets
// through. It matters more here than on the content tables — this row holds
// the shop's contact details, and a public PATCH would let anyone point the
// storefront's WhatsApp button at their own number.

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    return NextResponse.json({ settings: await readSiteSettings() });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    await saveSiteSettings(body);
    // Same tag the getter is cached under, so the footer and contact page pick
    // the change up on their next render instead of up to ten minutes later.
    revalidateTag('site-settings');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
