'use client';
// Cart + modal state, shared app-wide. Persists to localStorage so a refresh doesn't lose the cart.
// SWAP addToCart/placeOrder's internals for real API calls once the backend exists — see the
// commented TODOs below. Keep the context's public shape (the value object) so components don't change.

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';

const CartContext = createContext(null);
const STORAGE_KEY = 'ek_cart_v1';

export function CartProvider({ children }) {
  // Whole catalogue, fetched once and shared (via SWR's cache) with anything
  // else on the page asking for the same query — e.g. the shop browser's
  // facet counts. SWAP TARGET: this used to be a synchronous import of the
  // mock PRODUCTS array from lib/products.js; getProductById below keeps the
  // exact same signature so nothing downstream had to change.
  const { products, isLoading: productsLoading } = useProducts({ pageSize: 500 });
  const getProductById = useCallback((id) => products.find((p) => p.id === id) || null, [products]);

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
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }, [cart]);

  // getProductById has to be in the dependency list: with an empty one this
  // closed over the very first render's version, when the catalogue hadn't
  // loaded yet, so it always preselected `null` as the colourway — and a cart
  // line with no colourway is an order the database can't accept.
  const openProduct = useCallback((productId) => {
    const p = getProductById(productId);
    setActiveProductId(productId);
    // Preselect the first colourway that's actually in stock.
    const firstAvailable = p?.colors?.find((c) => c.stock > 0) || p?.colors?.[0];
    setActiveColorId(firstAvailable?.id ?? null);
    setActiveQty(1);
  }, [getProductById]);
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

  // Each line carries its own availability, checked against the live catalogue:
  //   unavailable  — the product or colourway no longer exists (deleted in
  //                  admin, or a stale cart saved before the catalogue changed)
  //   out_of_stock — the colourway is real but has nothing left
  //   insufficient — fewer left than the quantity in the cart
  // The checkout button reads this, so an order that the database is bound to
  // reject can't be submitted in the first place.
  //
  // While the catalogue is still loading every lookup misses, which is not the
  // same thing as unavailable — hence the productsLoading guard.
  const cartLines = useMemo(() => cart.map((line) => {
    const p = getProductById(line.productId);
    const color = p?.colors.find((c) => c.id === line.colorId);
    let issue = null;
    if (!productsLoading) {
      if (!p || !color) issue = 'unavailable';
      else if (color.stock === 0) issue = 'out_of_stock';
      else if (line.qty > color.stock) issue = 'insufficient';
    }
    return { ...line, product: p, color, stock: color?.stock ?? 0, issue, lineTotal: (p?.price || 0) * line.qty };
  }), [cart, getProductById, productsLoading]);

  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cartLines.reduce((s, l) => s + l.lineTotal, 0), [cartLines]);
  const cartIssues = useMemo(() => cartLines.filter((l) => l.issue), [cartLines]);

  // Places the order for whoever is logged in — the customer's name, phone and
  // email come from their account server-side, so only the delivery address
  // travels with the request. CheckoutModal makes sure an account exists (it
  // signs the customer up from the checkout fields) before calling this.
  //
  // Returns true on success; on failure it sets orderError and returns false,
  // so the modal can say what went wrong instead of silently showing a
  // "thank you" for an order that was never written.
  const placeOrder = useCallback(async (address) => {
    setPlacing(true);
    setOrderError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payMethod, address, lines: cart })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Say what actually went wrong. A generic "please try again" on a
        // cart that can never succeed just makes someone click it forever.
        if (data.error === 'out_of_stock') {
          const p = getProductById(data.productId);
          setOrderError(`${p?.name || 'One of these pieces'} is out of stock. Remove it from your cart to continue.`);
        } else if (data.error === 'unavailable_item') {
          setOrderError('Something in your cart is no longer available. Remove it and try again.');
        } else if (data.error === 'not_authenticated') {
          setOrderError('Your session expired. Log in again to place this order.');
        } else if (data.error === 'invalid_order') {
          setOrderError('Your cart looks empty. Add a piece and try again.');
        } else {
          setOrderError(data.message || "We couldn't place your order just now. Please try again.");
        }
        return false;
      }

      setOrderNumber(data.orderNumber);
      setOrderPlaced(true);
      setCart([]);
      return true;
    } catch {
      setOrderError("We couldn't reach the server. Check your connection and try again.");
      return false;
    } finally {
      setPlacing(false);
    }
  }, [cart, payMethod, getProductById]);

  const value = {
    cart, cartLines, cartCount, cartSubtotal, cartIssues,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    activeProductId, openProduct, closeProduct, getProductById,
    activeColorId, setActiveColorId, activeQty, setActiveQty,
    incLine, decLine, removeLine, addToCart,
    checkoutOpen,
    openCheckout: () => { setOrderError(null); setCheckoutOpen(true); },
    closeCheckout: () => { setCheckoutOpen(false); setOrderPlaced(false); setOrderError(null); },
    payMethod, setPayMethod, placeOrder, placing, orderPlaced, orderNumber, orderError, setOrderError
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
