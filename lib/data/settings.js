import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// The shop's own details — phone, email, address, hours, socials, and the few
// lines of storefront copy that aren't part of a list (see
// supabase/migrations/0005_site_settings.sql).
//
// Every reader goes through getSiteSettings(), which always resolves to a
// complete object: DEFAULTS fill in anything the row leaves null, and a
// database that hasn't had 0005 run yet falls back to DEFAULTS wholesale
// rather than taking the storefront down over a missing footer line.

const COLUMNS =
  'whatsapp_number,contact_phone,contact_email,address,hours,' +
  'facebook_url,instagram_url,youtube_url,tiktok_url,' +
  'newsletter_heading,newsletter_blurb,carousel_title,footer_note';

// The values these replaced, still in code so the site renders identically
// before the migration is run — and so a half-filled row can't produce a
// footer with a blank where the email should be.
const DEFAULTS = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923233002222',
  contactPhone: '+92 323 3002222',
  contactEmail: 'hello@elegancebykhadija.pk',
  address: 'Lahore, Pakistan',
  hours: 'Mon – Sat, 11am – 8pm PKT',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  newsletterHeading: 'Join the List',
  newsletterBlurb: 'New arrivals, restocks and sale access before anyone else.',
  carouselTitle: 'Pret SS26 Vol II',
  footerNote: 'ELEGANCE by Khadija © 2026. All rights reserved.',
};

export const SETTING_KEYS = Object.keys(DEFAULTS);

// snake_case in the database, camelCase in the components — the same split
// lib/data/content.js makes, for the same reason.
const COLUMN_OF = {
  whatsappNumber: 'whatsapp_number',
  contactPhone: 'contact_phone',
  contactEmail: 'contact_email',
  address: 'address',
  hours: 'hours',
  facebookUrl: 'facebook_url',
  instagramUrl: 'instagram_url',
  youtubeUrl: 'youtube_url',
  tiktokUrl: 'tiktok_url',
  newsletterHeading: 'newsletter_heading',
  newsletterBlurb: 'newsletter_blurb',
  carouselTitle: 'carousel_title',
  footerNote: 'footer_note',
};

function mapSettings(row) {
  const out = { ...DEFAULTS };
  if (!row) return out;
  for (const key of SETTING_KEYS) {
    const value = row[COLUMN_OF[key]];
    // Only a real value overrides the default. An empty string is a real value
    // for the socials ("we're not on it") but not for a phone number, so the
    // components decide what to do with a blank — this just doesn't invent one.
    if (value !== null && value !== undefined) out[key] = value;
  }
  return out;
}

async function fetchSiteSettings() {
  try {
    const db = supabaseServer();
    const { data, error } = await db.from('site_settings').select(COLUMNS).maybeSingle();
    if (error) throw error;
    return mapSettings(data);
  } catch {
    // Missing table (0005 not run yet), missing env vars, database down: the
    // footer and the contact page still render, with the details they had
    // before this table existed.
    return { ...DEFAULTS };
  }
}

export const getSiteSettings = unstable_cache(fetchSiteSettings, ['site-settings'], {
  tags: ['site-settings'],
  revalidate: 600,
});

// --- Admin -------------------------------------------------------------------

// Uncached: the admin form has to read back what it just wrote.
export async function readSiteSettings() {
  const db = supabaseServer();
  const { data, error } = await db.from('site_settings').select(COLUMNS).maybeSingle();
  if (error) throw error;
  return mapSettings(data);
}

// Upsert on the fixed id, so the first save works on a database whose seed
// insert never ran. Unknown keys are dropped rather than passed through —
// the request body reaches this straight from the browser.
export async function saveSiteSettings(patch) {
  const row = { id: true, updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch || {})) {
    if (!COLUMN_OF[key]) continue;
    row[COLUMN_OF[key]] = typeof value === 'string' ? value.trim() : value;
  }
  const db = supabaseServer();
  const { error } = await db.from('site_settings').upsert(row);
  if (error) throw error;
}
