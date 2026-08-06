'use client';
import useSWR from 'swr';
import { fetcher, sendJSON } from '@/lib/swr-fetcher';

// Admin order list (app/admin/orders/page.js, app/admin/page.js dashboard).
export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR('/api/orders', fetcher);
  return { orders: data?.orders ?? [], isLoading, error, mutate };
}

export const apiUpdateOrderStatus = (id, status) => sendJSON(`/api/orders/${id}`, 'PATCH', { status });
