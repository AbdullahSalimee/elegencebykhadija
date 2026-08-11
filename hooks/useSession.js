'use client';
import useSWR from 'swr';
import { fetcher, sendJSON } from '@/lib/swr-fetcher';

// Who's logged in, shared across every client component that asks (the nav,
// checkout, the account page) — SWR dedupes them into one /api/auth/me call.
//
// After login/signup/logout, call mutate() so the whole UI updates at once
// instead of each component discovering the change on its own schedule.
export function useSession() {
  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    // The session lives in an httpOnly cookie for a year; it doesn't change
    // while the customer is looking at the page, so don't re-check on every
    // window focus.
    revalidateOnFocus: false,
  });

  return {
    customer: data?.customer ?? null,
    isLoggedIn: !!data?.customer,
    isLoading,
    error,
    mutate,
  };
}

export const apiSignup = (body) => sendJSON('/api/auth/signup', 'POST', body);
export const apiLogin = (phone, password) => sendJSON('/api/auth/login', 'POST', { phone, password });
export const apiLogout = () => sendJSON('/api/auth/logout', 'POST');

// The customer's own orders, newest first, each with its full status timeline.
// 401 (signed out) is returned as an empty list rather than an error — the
// account page renders a "log in" prompt in that case, not a failure.
//
// Pass enabled=false to skip the request entirely (a null SWR key): the nav
// asks for this on every page to power the update badge, and there's no point
// asking on behalf of a visitor who isn't logged in.
export function useMyOrders(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(enabled ? '/api/account/orders' : null, fetcher, {
    shouldRetryOnError: false,
  });

  return {
    orders: data?.orders ?? [],
    isLoading,
    needsLogin: error?.status === 401,
    error: error?.status === 401 ? null : error,
    mutate,
  };
}
