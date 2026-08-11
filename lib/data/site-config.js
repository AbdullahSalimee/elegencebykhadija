import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// Server-only site-config data access. SWAP TARGET for the old lib/site-config.js
// CATEGORIES/NAV_LINKS constants — same shape ({id,label} / {id,label,href,order}).

async function fetchCategories() {
  const db = supabaseServer();
  const { data, error } = await db.from('categories').select('id,label').order('label');
  if (error) throw error;
  return data || [];
}

// The accent/feature_* columns belong to the mega menu (migration 0004) and are
// returned here so the admin can edit them. The storefront doesn't read this
// function any more — Nav assembles the nested menu through
// lib/data/content.js getMegaNav() instead — so this shape now serves the
// admin panels only.
async function fetchNavLinks() {
  const db = supabaseServer();
  const { data, error } = await db
    .from('nav_links')
    .select('id,label,href,sort_order,accent,feature_eyebrow,feature_title,feature_href')
    .order('sort_order');
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    label: r.label,
    href: r.href,
    order: r.sort_order,
    accent: r.accent,
    feature_eyebrow: r.feature_eyebrow,
    feature_title: r.feature_title,
    feature_href: r.feature_href,
  }));
}

export const getCategories = unstable_cache(fetchCategories, ['categories-list'], {
  tags: ['site-config'],
  revalidate: 600,
});

export const getNavLinks = unstable_cache(fetchNavLinks, ['nav-links-list'], {
  tags: ['site-config'],
  revalidate: 600,
});

// --- Admin mutations (uncached; API route revalidates the `site-config` tag)

export async function createCategory({ id, label }) {
  const db = supabaseServer();
  const { error } = await db.from('categories').insert({ id, label });
  if (error) throw error;
}

export async function updateCategory(id, label) {
  const db = supabaseServer();
  const { error } = await db.from('categories').update({ label }).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  const db = supabaseServer();
  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createNavLink({ id, label, href, order }) {
  const db = supabaseServer();
  const { error } = await db.from('nav_links').insert({ id, label, href, sort_order: order });
  if (error) throw error;
}

export async function updateNavLink(id, fields) {
  const db = supabaseServer();
  const patch = { ...fields };
  if ('order' in patch) {
    patch.sort_order = patch.order;
    delete patch.order;
  }
  const { error } = await db.from('nav_links').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteNavLink(id) {
  const db = supabaseServer();
  const { error } = await db.from('nav_links').delete().eq('id', id);
  if (error) throw error;
}
