'use client';
import useSWR from 'swr';
import { fetcher, sendJSON } from '@/lib/swr-fetcher';

// Storefront content for the admin panels (app/admin/content). The storefront
// itself never uses these — Server Components read lib/data/content.js
// directly, so the homepage ships with its content in the HTML rather than
// fetching it after hydration.
//
// `table` is one of the content tables listed in lib/data/content.js.

export function useContent(table) {
  const { data, error, isLoading, mutate } = useSWR(
    table ? `/api/content/${table}` : null,
    fetcher
  );
  return { rows: data?.rows ?? [], isLoading, error, mutate };
}

// Child links of one footer or mega-menu column. Keyed by column, so opening a
// second column doesn't refetch the first.
export function useContentLinks(table, columnId) {
  const { data, error, isLoading, mutate } = useSWR(
    table && columnId ? `/api/content/${table}?columnId=${encodeURIComponent(columnId)}` : null,
    fetcher
  );
  return { links: data?.rows ?? [], isLoading, error, mutate };
}

export const apiSaveContent = (table, row) => sendJSON(`/api/content/${table}`, 'POST', row);
export const apiPatchContent = (table, id, fields) =>
  sendJSON(`/api/content/${table}/${encodeURIComponent(id)}`, 'PATCH', fields);
export const apiDeleteContent = (table, id) =>
  sendJSON(`/api/content/${table}/${encodeURIComponent(id)}`, 'DELETE');

export const apiCreateLink = (table, row) => sendJSON(`/api/content/${table}`, 'POST', row);
export const apiPatchLink = (table, id, fields) =>
  sendJSON(`/api/content/${table}/${id}`, 'PATCH', fields);
export const apiDeleteLink = (table, id) => sendJSON(`/api/content/${table}/${id}`, 'DELETE');
