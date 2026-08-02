# Elegance by Khadija — Next.js storefront

A working Next.js (App Router) build of the storefront UI: home, product quick-view, cart drawer,
and checkout with Cash on Delivery / WhatsApp / JazzCash-Easypaisa (disabled placeholder). Built so
wiring up a real backend is additive, not a rewrite.

## Run it

```
npm install
cp .env.example .env.local
npm run dev
```

## Where things live

- `lib/products.js` — mock product + variant data. Replace `PRODUCTS` with a real fetch
  (`getProducts()`) once you have a database; keep the same shape (`id, name, fabric, pieces,
  price, compareAt, colors[]`) and every component keeps working unchanged.
- `lib/cart-context.js` — all cart/modal state (`useCart()` hook), persisted to `localStorage`.
  `addToCart` and `placeOrder` are the two functions that will eventually talk to your API —
  they're already isolated here.
- `app/api/orders/route.js` — the order-intake endpoint. Currently returns a fake order number.
  The comments inside describe the real implementation: a DB transaction that checks and
  decrements variant stock, inserts the order as `pending`, and moves through
  `pending → confirmed → dispatched → delivered → returned`.
- `components/` — one file per UI piece (Nav, Hero, ProductGrid, ProductModal, CartDrawer,
  CheckoutModal, Footer). Plain React, no UI library — easy to hand to any developer.
- `app/globals.css` — all design tokens (colors, type, spacing) as CSS variables, ported from the
  Classical direction. Change a token here to reskin the whole app.

## Wiring up a real backend (recommended order)

1. **Schema first.** Model `product` (shell) and `variant` (the sellable thing — size/color/
   stitched-vs-unstitched, its own price and stock) as separate tables. Don't put stock on the
   product.
2. **Stock locking.** Decrement stock inside the same transaction that creates the order, not at
   checkout-button-click time. Reserve stock for ~10–15 min if you add a real payment step.
3. **WhatsApp + in-store orders still need a row.** Any order Khadija enters manually (from a
   WhatsApp chat) should still land in the same `orders` table so stock stays accurate across
   channels.
4. **Payments are optional at launch.** COD + WhatsApp need no gateway. Add JazzCash/Easypaisa once
   the merchant account is approved — both are hosted-checkout redirects + a server-side signature
   + a webhook that flips `pending → paid` (see comments in `app/api/orders/route.js`). Never trust
   the browser redirect alone; always verify server-side.
5. **Images.** Each variant (not just each product) needs its own photos. Swap the `.ph` placeholder
   divs for `next/image` once real photography exists, and put it behind a CDN/image-optimization
   service — this matters more than most product categories since buyers are judging fabric and
   color from the photo alone.

## Not included (intentionally)

No database, ORM, auth, or payment SDK is wired in — those are business decisions (which DB, which
hosting) better made by whoever inherits this. The UI and the seams to plug into are what's here.
