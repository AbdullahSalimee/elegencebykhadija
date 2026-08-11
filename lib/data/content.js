import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// Server-only storefront content: everything the homepage and chrome render
// that isn't a product or an order. SWAP TARGET for the hand-written constants
// that used to live in lib/site-config.js — every getter below returns the
// exact shape its component already expected (cta stays a nested { label, href }
// object, mobile_image becomes mobileImage), so nothing downstream changed.
//
// Server Components call these directly. app/api/content/* wraps them for the
// admin panels, which are client components and can't import server-only code.
//
// Cached under one `site-content` tag: the admin writes are infrequent and
// always revalidate the whole tag, so splitting it per-table would buy nothing.

const CACHE = { tags: ['site-content'], revalidate: 600 };

// --- Flat ordered lists -----------------------------------------------------
//
// These six tables differ only in their columns, so the read path is shared.
// `active` is filtered here rather than in each caller: a row toggled off in
// the admin should disappear from the storefront but stay visible (and
// editable) in the admin, which reads through the API instead.

async function listRows(table, columns, { activeOnly = true } = {}) {
  const db = supabaseServer();
  let query = db.from(table).select(columns).order('sort_order');
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

const mapCta = (row) => ({
  ...row,
  cta: row.cta_label ? { label: row.cta_label, href: row.cta_href } : null,
});

async function fetchHeroSlides() {
  const rows = await listRows(
    'hero_slides',
    'id,eyebrow,title,body,cta_label,cta_href,image,mobile_image,sort_order'
  );
  return rows.map((r) => ({
    id: r.id,
    eyebrow: r.eyebrow,
    title: r.title,
    body: r.body,
    cta: r.cta_label ? { label: r.cta_label, href: r.cta_href } : null,
    image: r.image,
    mobileImage: r.mobile_image,
  }));
}

async function fetchCategoryTiles() {
  return listRows('category_tiles', 'id,label,href,image,sort_order');
}

async function fetchCollectionBlocks() {
  return listRows('collection_blocks', 'id,heading,caption,href,image,sort_order');
}

async function fetchPromoBanners() {
  const rows = await listRows(
    'promo_banners',
    'id,eyebrow,title,body,cta_label,cta_href,image,sort_order'
  );
  return rows.map(mapCta);
}

async function fetchAnnouncements() {
  return listRows('announcements', 'id,message,sort_order');
}

async function fetchTrustItems() {
  return listRows('trust_items', 'id,title,body,sort_order', { activeOnly: false });
}

async function fetchUtilityLinks() {
  return listRows('utility_links', 'id,label,href,sort_order', { activeOnly: false });
}

async function fetchShippingRegions() {
  return listRows('shipping_regions', 'id,label,sort_order', { activeOnly: false });
}

// --- Mega menu --------------------------------------------------------------
//
// Assembled from three tables into the nested shape Nav.js renders. A nav_link
// with no columns comes back without a `panel`, which is what makes it a plain
// link rather than a mega menu — same rule as the old hand-written config.

async function fetchMegaNav() {
  const db = supabaseServer();

  const [links, columns, columnLinks] = await Promise.all([
    db
      .from('nav_links')
      .select('id,label,href,sort_order,accent,feature_eyebrow,feature_title,feature_href')
      .order('sort_order'),
    db.from('nav_columns').select('id,nav_link_id,heading,sort_order').order('sort_order'),
    db.from('nav_column_links').select('id,column_id,label,href,sort_order').order('sort_order'),
  ]);

  if (links.error) throw links.error;
  if (columns.error) throw columns.error;
  if (columnLinks.error) throw columnLinks.error;

  // Grouped in one pass each rather than filtering the child arrays per parent,
  // which would be O(links × columns × links) on every render.
  const linksByColumn = new Map();
  for (const l of columnLinks.data || []) {
    if (!linksByColumn.has(l.column_id)) linksByColumn.set(l.column_id, []);
    linksByColumn.get(l.column_id).push({ label: l.label, href: l.href });
  }

  const columnsByLink = new Map();
  for (const c of columns.data || []) {
    if (!columnsByLink.has(c.nav_link_id)) columnsByLink.set(c.nav_link_id, []);
    columnsByLink.get(c.nav_link_id).push({
      id: c.id,
      heading: c.heading,
      links: linksByColumn.get(c.id) || [],
    });
  }

  return (links.data || []).map((l) => {
    const cols = columnsByLink.get(l.id) || [];
    return {
      id: l.id,
      label: l.label,
      href: l.href,
      accent: l.accent,
      panel: cols.length
        ? {
            // Null rather than an object of empty strings when the admin has
            // cleared it — the panel then renders columns only, instead of an
            // empty promo card taking up a third of the width.
            feature: l.feature_title
              ? {
                  eyebrow: l.feature_eyebrow,
                  title: l.feature_title,
                  href: l.feature_href,
                }
              : null,
            columns: cols,
          }
        : null,
    };
  });
}

// --- Footer -----------------------------------------------------------------

async function fetchFooterColumns() {
  const db = supabaseServer();

  const [columns, links] = await Promise.all([
    db.from('footer_columns').select('id,heading,sort_order').order('sort_order'),
    db.from('footer_links').select('id,column_id,label,href,sort_order').order('sort_order'),
  ]);
  if (columns.error) throw columns.error;
  if (links.error) throw links.error;

  const linksByColumn = new Map();
  for (const l of links.data || []) {
    if (!linksByColumn.has(l.column_id)) linksByColumn.set(l.column_id, []);
    linksByColumn.get(l.column_id).push({ label: l.label, href: l.href });
  }

  return (columns.data || []).map((c) => ({
    id: c.id,
    heading: c.heading,
    links: linksByColumn.get(c.id) || [],
  }));
}

// --- Cached readers ---------------------------------------------------------

export const getHeroSlides = unstable_cache(fetchHeroSlides, ['hero-slides'], CACHE);
export const getCategoryTiles = unstable_cache(fetchCategoryTiles, ['category-tiles'], CACHE);
export const getCollectionBlocks = unstable_cache(fetchCollectionBlocks, ['collection-blocks'], CACHE);
export const getPromoBanners = unstable_cache(fetchPromoBanners, ['promo-banners'], CACHE);
export const getAnnouncements = unstable_cache(fetchAnnouncements, ['announcements'], CACHE);
export const getTrustItems = unstable_cache(fetchTrustItems, ['trust-items'], CACHE);
export const getUtilityLinks = unstable_cache(fetchUtilityLinks, ['utility-links'], CACHE);
export const getShippingRegions = unstable_cache(fetchShippingRegions, ['shipping-regions'], CACHE);
export const getMegaNav = unstable_cache(fetchMegaNav, ['mega-nav'], CACHE);
export const getFooterColumns = unstable_cache(fetchFooterColumns, ['footer-columns'], CACHE);

// --- Admin reads ------------------------------------------------------------
//
// Uncached and unfiltered: the admin needs to see rows it has toggled off, and
// needs them fresh immediately after an edit.

const ADMIN_SELECTS = {
  announcements: 'id,message,sort_order,active',
  utility_links: 'id,label,href,sort_order',
  hero_slides: 'id,eyebrow,title,body,cta_label,cta_href,image,mobile_image,sort_order,active',
  category_tiles: 'id,label,href,image,sort_order,active',
  collection_blocks: 'id,heading,caption,href,image,sort_order,active',
  promo_banners: 'id,eyebrow,title,body,cta_label,cta_href,image,sort_order,active',
  trust_items: 'id,title,body,sort_order',
  shipping_regions: 'id,label,sort_order',
  footer_columns: 'id,heading,sort_order',
  nav_columns: 'id,nav_link_id,heading,sort_order',
};

export const CONTENT_TABLES = Object.keys(ADMIN_SELECTS);

export async function listContent(table) {
  if (!ADMIN_SELECTS[table]) throw new Error(`unknown content table: ${table}`);
  const db = supabaseServer();
  const { data, error } = await db.from(table).select(ADMIN_SELECTS[table]).order('sort_order');
  if (error) throw error;
  return data || [];
}

// --- Admin mutations --------------------------------------------------------
//
// Generic on purpose: ten tables with the same {id, ...fields, sort_order}
// shape would otherwise be thirty near-identical functions. The table name is
// checked against ADMIN_SELECTS above, so a request can't reach an arbitrary
// table through this path.

export async function upsertContent(table, row) {
  if (!ADMIN_SELECTS[table]) throw new Error(`unknown content table: ${table}`);
  const db = supabaseServer();
  const { error } = await db.from(table).upsert(row);
  if (error) throw error;
}

export async function deleteContent(table, id) {
  if (!ADMIN_SELECTS[table]) throw new Error(`unknown content table: ${table}`);
  const db = supabaseServer();
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) throw error;
}

// Child-row helpers for the two parent/child pairs. Kept separate from the
// generic path above because their primary key is a bigserial, not a text id
// the admin supplies.

export async function listChildLinks(table, columnId) {
  if (table !== 'footer_links' && table !== 'nav_column_links') {
    throw new Error(`unknown link table: ${table}`);
  }
  const db = supabaseServer();
  const { data, error } = await db
    .from(table)
    .select('id,column_id,label,href,sort_order')
    .eq('column_id', columnId)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function createChildLink(table, row) {
  if (table !== 'footer_links' && table !== 'nav_column_links') {
    throw new Error(`unknown link table: ${table}`);
  }
  const db = supabaseServer();
  const { data, error } = await db.from(table).insert(row).select('id').single();
  if (error) throw error;
  return data;
}

export async function updateChildLink(table, id, fields) {
  if (table !== 'footer_links' && table !== 'nav_column_links') {
    throw new Error(`unknown link table: ${table}`);
  }
  const db = supabaseServer();
  const { error } = await db.from(table).update(fields).eq('id', id);
  if (error) throw error;
}

export async function deleteChildLink(table, id) {
  if (table !== 'footer_links' && table !== 'nav_column_links') {
    throw new Error(`unknown link table: ${table}`);
  }
  const db = supabaseServer();
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) throw error;
}
