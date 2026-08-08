'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSession, useMyOrders } from '@/hooks/useSession';

// "Has anything happened to my orders since I last looked?"
//
// The status a customer has already seen is remembered per device in
// localStorage; anything that differs from it now — because an admin moved the
// order on in /admin/orders — counts as an update and lights up the account
// icon in the nav. Opening /track marks everything seen again.
//
// Deliberately device-local: this is a "you have something to look at" hint,
// not a message queue, so it doesn't need a table or a read/unread column.

const KEY = 'ek_seen_status_v1';
// Two components use this hook (the nav badge and the account page that clears
// it) and localStorage doesn't notify anyone when it changes, so writes
// announce themselves and every hook instance re-reads.
const EVENT = 'ek:order-updates';

const readSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

const writeSeen = (map) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // Private mode / full storage: the badge just stops persisting. Not worth
    // failing anything over.
  }
  window.dispatchEvent(new Event(EVENT));
};

const STATUS_LABEL = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  returned: 'Returned',
};

export function useOrderUpdates() {
  const { isLoggedIn } = useSession();
  const { orders } = useMyOrders(isLoggedIn);
  // null until the first client-side read, so the server render and the first
  // client render agree (localStorage doesn't exist during SSR).
  const [seen, setSeen] = useState(null);

  useEffect(() => {
    setSeen(readSeen() || {});
    const onChange = () => setSeen(readSeen() || {});
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  // Record orders we've never seen before at their current status, silently.
  // A brand-new device shouldn't announce "updates" for orders the customer
  // already knows about — but from this point on, any change to them does.
  useEffect(() => {
    if (!isLoggedIn || orders.length === 0) return;
    const current = readSeen();
    if (current === null) {
      writeSeen(Object.fromEntries(orders.map((o) => [o.id, o.status])));
      return;
    }
    const unknown = orders.filter((o) => !(o.id in current));
    if (unknown.length === 0) return;
    const next = { ...current };
    unknown.forEach((o) => { next[o.id] = o.status; });
    writeSeen(next);
  }, [isLoggedIn, orders]);

  const updatedOrders = seen
    ? orders.filter((o) => seen[o.id] && seen[o.id] !== o.status)
    : [];

  const markAllSeen = useCallback(() => {
    if (orders.length === 0) return;
    const next = { ...(readSeen() || {}) };
    orders.forEach((o) => { next[o.id] = o.status; });
    writeSeen(next);
  }, [orders]);

  return {
    updatedOrders,
    updatedCount: updatedOrders.length,
    statusLabel: (status) => STATUS_LABEL[status] || status,
    markAllSeen,
  };
}
