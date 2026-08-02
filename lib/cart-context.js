'use client';
// Cart + modal state, shared app-wide. Persists to localStorage so a refresh doesn't lose the cart.
// SWAP addToCart/placeOrder's internals for real API calls once the backend exists — see the
// commented TODOs below. Keep the context's public shape (the value object) so components don't change.

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getProductById } from './products';

const CartContext = createContext(null);
const STORAGE_KEY = 'ek_cart_v1';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]); // [{ productId, colorId, qty }]
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [activeColorId, setActiveColorId] = useState(null);
  const [activeQty, setActiveQty] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }, [cart]);

  const openProduct = useCallback((productId) => {
    const p = getProductById(productId);
    setActiveProductId(productId);
    setActiveColorId(p?.colors?.[0]?.id ?? null);
    setActiveQty(1);
  }, []);
  const closeProduct = useCallback(() => setActiveProductId(null), []);

  const addToCart = useCallback((productId, colorId, qty) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId && l.colorId === colorId);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { productId, colorId, qty }];
    });
    setActiveProductId(null);
    setCartOpen(true);
  }, []);

  const incLine = useCallback((idx) => setCart((prev) => prev.map((l, i) => (i === idx ? { ...l, qty: l.qty + 1 } : l))), []);
  const decLine = useCallback((idx) => setCart((prev) => prev.map((l, i) => (i === idx ? { ...l, qty: Math.max(1, l.qty - 1) } : l))), []);
  const removeLine = useCallback((idx) => setCart((prev) => prev.filter((_, i) => i !== idx)), []);

  const cartLines = useMemo(() => cart.map((line) => {
    const p = getProductById(line.productId);
    const color = p?.colors.find((c) => c.id === line.colorId);
    return { ...line, product: p, color, lineTotal: (p?.price || 0) * line.qty };
  }), [cart]);
  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cartLines.reduce((s, l) => s + l.lineTotal, 0), [cartLines]);

  const placeOrder = useCallback(async (contact) => {
    setPlacing(true);
    try {
      // TODO real backend: POST to /api/orders with { contact, payMethod, lines: cart }.
      // The route should run inside a DB transaction: create the order row, decrement variant
      // stock, and reject with 409 if any line is out of stock (see app/api/orders/route.js).
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, payMethod, lines: cart })
      });
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      setOrderPlaced(true);
      setCart([]);
    } finally {
      setPlacing(false);
    }
  }, [cart, payMethod]);

  const value = {
    cart, cartLines, cartCount, cartSubtotal,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    activeProductId, openProduct, closeProduct,
    activeColorId, setActiveColorId, activeQty, setActiveQty,
    incLine, decLine, removeLine, addToCart,
    checkoutOpen, openCheckout: () => setCheckoutOpen(true), closeCheckout: () => { setCheckoutOpen(false); setOrderPlaced(false); },
    payMethod, setPayMethod, placeOrder, placing, orderPlaced, orderNumber
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
