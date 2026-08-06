import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// Server-only product data access. Server Components call these directly
// (no network hop); app/api/products/* wraps them for client components.
// SWAP TARGET: this file used to be lib/products.js's hardcoded PRODUCTS
// array — every consumer keeps the same object shape (id, name, fabric,
// pieces, price, compareAt, colors[]) so nothing downstream had to change.

const PRODUCT_COLUMNS =
  'id,name,fabric,pieces,price,compare_at,category,arrived_at,image_url,on_sale,product_variants(id,hex,label,stock)';

function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    fabric: row.fabric,
    pieces: row.pieces,
    price: Number(row.price),
    compareAt: row.compare_at == null ? null : Number(row.compare_at),
    category: row.category,
    arrivedAt: row.arrived_at,
    image: row.image_url || null,
    onSale: row.on_sale,
    colors: (row.product_variants || []).map((v) => ({
      id: v.id,
      hex: v.hex,
      label: v.label,
      stock: v.stock,
    })),
  };
}

const SORTS = {
  newest: { column: 'arrived_at', ascending: false },
  'price-asc': { column: 'price', ascending: true },
  'price-desc': { column: 'price', ascending: false },
  name: { column: 'name', ascending: true },
};

async function fetchProducts({
  category,
  fabric,
  pieces,
  maxPrice,
  onSale,
  inStock,
  q,
  sort = 'newest',
  page = 1,
  pageSize = 24,
} = {}) {
  const db = supabaseServer();
  const { column, ascending } = SORTS[sort] || SORTS.newest;

  let query = db
    .from('products')
    .select(PRODUCT_COLUMNS, { count: inStock ? undefined : 'exact' })
    .order(column, { ascending });

  if (category?.length) query = query.in('category', category);
  if (fabric?.length) query = query.in('fabric', fabric);
  if (pieces?.length) query = query.in('pieces', pieces);
  if (typeof maxPrice === 'number') query = query.lte('price', maxPrice);
  if (q && q.trim()) {
    // Strip characters that are significant in PostgREST's filter syntax
    // (%, comma, parens) rather than trying to escape them — search terms
    // never legitimately need them, and this keeps the .or() string safe
    // to build from raw user input.
    const safe = q.trim().replace(/[%,()]/g, '');
    if (safe) query = query.or(`name.ilike.%${safe}%,fabric.ilike.%${safe}%`);
  }
  if (onSale) query = query.eq('on_sale', true);

  // `inStock` depends on an aggregate over the nested variants table, which
  // PostgREST can't push down as a plain row filter without a maintained
  // column or a second round trip. At this catalogue's scale it's simpler
  // (and correct) to filter the already-narrow, indexed candidate set in
  // JS. Because that filter runs after the fetch, DB-level range()
  // pagination would return short pages, so pagination moves to JS too
  // in this one case — every other filter combination paginates in Postgres.
  if (!inStock) {
    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    return { products: (data || []).map(mapProduct), total: count ?? 0 };
  }

  const { data, error } = await query;
  if (error) throw error;
  const filtered = (data || []).map(mapProduct).filter((p) => p.colors.some((c) => c.stock > 0));
  const from = (page - 1) * pageSize;
  return { products: filtered.slice(from, from + pageSize), total: filtered.length };
}

async function fetchProductById(id) {
  const db = supabaseServer();
  const { data, error } = await db.from('products').select(PRODUCT_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return mapProduct(data);
}

export const getProducts = unstable_cache(fetchProducts, ['products-list'], {
  tags: ['products'],
  revalidate: 300,
});

export const getProductById = unstable_cache(fetchProductById, ['product-by-id'], {
  tags: ['products'],
  revalidate: 300,
});

// --- Admin mutations (uncached — writes go straight to the DB; the calling
// API route revalidates the `products` tag afterwards). Photo uploads stay
// client-side-only for now (see app/admin/products/page.js) since there's
// no image storage wired up yet.

export async function updateVariantStock(variantId, stock) {
  const db = supabaseServer();
  const { error } = await db.from('product_variants').update({ stock }).eq('id', variantId);
  if (error) throw error;
}

export async function updateProductFields(productId, fields) {
  const db = supabaseServer();
  const { error } = await db.from('products').update(fields).eq('id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId) {
  const db = supabaseServer();
  const { error } = await db.from('products').delete().eq('id', productId);
  if (error) throw error;
}

export async function createProduct({ id, name, fabric, pieces, price, compareAt, category, colors }) {
  const db = supabaseServer();
  const { error: productError } = await db.from('products').insert({
    id,
    name,
    fabric,
    pieces,
    price,
    compare_at: compareAt ?? null,
    category,
  });
  if (productError) throw productError;

  const variantRows = (colors || []).map((c) => ({
    id: c.id,
    product_id: id,
    hex: c.hex,
    label: c.label,
    stock: c.stock,
  }));
  if (variantRows.length) {
    const { error: variantError } = await db.from('product_variants').insert(variantRows);
    if (variantError) throw variantError;
  }
}
