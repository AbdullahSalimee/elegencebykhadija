'use client';
import useSWR from 'swr';
import { fetcher, sendJSON } from '@/lib/swr-fetcher';

// Nav bar links + product categories (app/admin/settings/page.js, Nav.js,
// ShopBrowser.js, admin/products category picker).
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR('/api/categories', fetcher);
  return { categories: data?.categories ?? [], isLoading, error, mutate };
}

export function useNavLinks() {
  const { data, error, isLoading, mutate } = useSWR('/api/nav-links', fetcher);
  return { navLinks: data?.navLinks ?? [], isLoading, error, mutate };
}

export const apiCreateCategory = (body) => sendJSON('/api/categories', 'POST', body);
export const apiUpdateCategory = (id, label) => sendJSON(`/api/categories/${id}`, 'PATCH', { label });
export const apiDeleteCategory = (id) => sendJSON(`/api/categories/${id}`, 'DELETE');

export const apiCreateNavLink = (body) => sendJSON('/api/nav-links', 'POST', body);
export const apiUpdateNavLink = (id, fields) => sendJSON(`/api/nav-links/${id}`, 'PATCH', fields);
export const apiDeleteNavLink = (id) => sendJSON(`/api/nav-links/${id}`, 'DELETE');
