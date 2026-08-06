# Elegance by Khadija — Next.js storefront

A Next.js (App Router) storefront backed by Supabase: home, product quick-view, cart drawer,
checkout with Cash on Delivery / WhatsApp / JazzCash-Easypaisa (disabled placeholder), order
tracking, and an admin console for stock, orders, and nav/category settings.

## Set up Supabase (required — the app won't build or run without this)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run, in order: `supabase/migrations/0001_init.sql`,
   `supabase/migrations/0002_storage.sql`, `supabase/migrations/0003_order_tracking.sql`, then
   `supabase/seed.sql` (seeds the same 6 products / 5 orders the app used to ship as mock data).
3. In Project Settings → API, copy the **Project URL** and the **service_role** key.
4. `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY`.

```
npm install
npm run dev
```

Email (order confirmation + status follow-ups) is optional — see **Email** below. Everything else
works without it.

## Where things live

- `supabase/migrations/0001_init.sql` — schema: `products` / `product_variants` (stock lives on
  the variant, never the product) / `categories` / `nav_links` / `orders` / `order_lines`, plus
  `place_order()`, a Postgres function that atomically locks stock, decrements it, and inserts an
  order in one transaction.
- `supabase/migrations/0002_storage.sql` — the `product-images` Storage bucket (public, served
  through Supabase's CDN) that admin photo uploads land in.
- `supabase/migrations/0003_order_tracking.sql` — `order_status_history` (a trigger logs every
  status an order has ever been in — not just the current one) backing `/track`.
- `lib/supabase/server.js` — the one server-only Supabase client (service role key — never sent
  to the browser; guarded with the `server-only` package so an accidental client import fails
  the build instead of leaking the key).
- `lib/data/*.js` — server-only data access (`getProducts`, `getOrders`, `placeOrder`,
  `getOrderForTracking`, …), wrapped in `unstable_cache` with tag-based revalidation. **Server
  Components import these directly** — no network hop.
- `app/api/*` — REST endpoints backing the client-side hooks below. Client Components never talk
  to Supabase directly; they go through these routes so query shaping/validation lives in one
  place.
- `hooks/*.js` — SWR-based hooks (`useProducts`, `useProductsInfinite`, `useOrders`,
  `useCategories`, `useNavLinks`) for anything that needs data in a Client Component (filters,
  cart, admin). SWR dedupes and caches by key, so multiple components asking for the same data in
  the same render share one request.
- `lib/cart-context.js` — cart/modal state (`useCart()`), persisted to `localStorage`.
  `getProductById` reads from the shared product cache (`useProducts`); `placeOrder` posts to
  `/api/orders`, which really checks and decrements stock now.
- `components/ProductCard.js` — the one interactive piece (click-to-open + photo) shared by every
  product grid; everything else in those grids is a plain Server Component.
- `app/track/` + `app/api/orders/track/route.js` — public order tracking (order number + phone,
  same generic "not found" for either being wrong so orders can't be enumerated). Linked from the
  footer and the post-checkout confirmation.
- `lib/email.js` — order confirmation + status-change emails via Resend. Provider-swappable: every
  call site only knows `sendOrderConfirmationEmail`/`sendOrderStatusEmail`, not Resend itself.
- `app/globals.css` — design tokens (colors, spacing) as CSS variables; fonts are loaded via
  `next/font` in `app/layout.js` and exposed as `--font-cormorant` / `--font-lora`.

## Images

Admin product photo uploads (`app/admin/products`) go to `/api/uploads/product-image`, which
resizes to fit 1200×1500 and re-encodes to WebP with `sharp` **before** it ever reaches Supabase
Storage — a multi-megabyte phone photo can't end up stored as-is no matter what gets picked.
Storefront product cards render the result through `next/image` (AVIF/WebP, lazy-loaded); a
product with no photo yet falls back to the placeholder tiles.

## Email

Optional. Create a free account at [resend.com](https://resend.com), verify a sending domain, and
set `RESEND_API_KEY` + `EMAIL_FROM` in `.env.local`. Two emails fire automatically:
- **Order confirmation**, right after checkout — only if the customer entered an email (it's an
  optional field; COD/WhatsApp orders in Pakistan very often don't have one).
- **Status follow-up**, whenever an admin changes an order's status in `/admin/orders`.

Without `RESEND_API_KEY` set, both quietly no-op (logged to the console) — an unconfigured or
down email provider never blocks placing or updating an order.

## Known gaps

- **No auth.** Admin routes (`/admin/*` and their `/api/*` mutation endpoints) are not
  authenticated — same as before, not a regression introduced here, but worth fixing before this
  goes live with real customer/order data.
- **Payments.** COD + WhatsApp need no gateway. Add JazzCash/Easypaisa once the merchant account
  is approved — both are hosted-checkout redirects + a server-side signature + a webhook that
  flips `pending → paid`. Never trust the browser redirect alone; always verify server-side.
