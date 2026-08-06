'use client';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { fetcher, sendJSON } from '@/lib/swr-fetcher';

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category?.length) params.set('category', filters.category.join(','));
  if (filters.fabric?.length) params.set('fabric', filters.fabric.join(','));
  if (filters.pieces?.length) params.set('pieces', filters.pieces.join(','));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.onSale) params.set('onSale', '1');
  if (filters.inStock) params.set('inStock', '1');
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  return params.toString();
}

// Client-side product fetching, backed by /api/products. Server Components
// should call lib/data/products.js directly instead — this hook is for
// client components (filters, cart, admin) where a plain import can't work.
// SWR dedupes/caches by key: two components asking for the same filters in
// the same render pass share one in-flight request instead of firing two.
export function useProducts(filters, swrOptions) {
  const qs = buildQuery(filters);
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/api/products?${qs}`,
    fetcher,
    swrOptions
  );
  return {
    products: data?.products ?? [],
    total: data?.total ?? 0,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export function useProduct(id) {
  const { data, error, isLoading } = useSWR(id ? `/api/products/${id}` : null, fetcher);
  return { product: data?.product ?? null, isLoading, error };
}

// Paginated "load more" fetching for the shop browser (checklist: paginate
// instead of loading the whole catalogue). Backed by useSWRInfinite so
// changing a filter and calling `reset()` starts a clean page 1, while
// clicking "load more" appends a page without re-fetching earlier ones.
export function useProductsInfinite(filters, pageSize, swrOptions) {
  const getKey = (pageIndex, previousPage) => {
    if (previousPage && previousPage.products.length === 0) return null;
    return `/api/products?${buildQuery({ ...filters, page: pageIndex + 1, pageSize })}`;
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    swrOptions
  );

  const products = (data || []).flatMap((page) => page.products);
  const total = data?.[0]?.total ?? 0;

  return {
    products,
    total,
    hasMore: products.length < total,
    isLoading,
    isValidating,
    error,
    loadMore: () => setSize(size + 1),
    reset: () => setSize(1),
    mutate,
  };
}

// --- Admin mutations (app/admin/products/page.js). Plain fetch wrappers,
// not hooks themselves — the admin page keeps its own local state for
// instant input feedback and calls these alongside it to persist.
export const apiCreateProduct = (body) => sendJSON('/api/products', 'POST', body);
export const apiPatchProduct = (id, body) => sendJSON(`/api/products/${id}`, 'PATCH', body);
export const apiDeleteProduct = (id) => sendJSON(`/api/products/${id}`, 'DELETE');
