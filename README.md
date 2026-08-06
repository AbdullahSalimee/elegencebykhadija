# Elegance by Khadija — Next.js storefront

A Next.js (App Router) storefront backed by Supabase: home, product quick-view, cart drawer,
checkout with Cash on Delivery / WhatsApp / JazzCash-Easypaisa (disabled placeholder), and an
admin console for stock, orders, and nav/category settings.

## Set up Supabase (required — the app won't build or run without this)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`
   (seeds the same 6 products / 5 orders the app used to ship as mock data).
3. In Project Settings → API, copy the **Project URL** and the **service_role** key.
4. `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY`.

```
npm install
npm run dev
```

## Where things live

- `supabase/migrations/0001_init.sql` — schema: `products` / `product_variants` (stock lives on
  the variant, never the product — two customers can't oversell the same colourway) /
  `categories` / `nav_links` / `orders` / `order_lines`, plus `place_order()`, a Postgres function
  that atomically locks stock, decrements it, and inserts an order in one transaction.
- `lib/supabase/server.js` — the one server-only Supabase client (service role key — never sent
  to the browser; guarded with the `server-only` package so an accidental client import fails
  the build instead of leaking the key).
- `lib/data/*.js` — server-only data access (`getProducts`, `getOrders`, `placeOrder`, …), wrapped
  in `unstable_cache` with tag-based revalidation. **Server Components import these directly** —
  no network hop.
- `app/api/*` — REST endpoints backing the client-side hooks below. Client Components never talk
  to Supabase directly; they go through these routes so query shaping/validation lives in one
  place.
- `hooks/*.js` — SWR-based hooks (`useProducts`, `useProductsInfinite`, `useOrders`,
  `useCategories`, `useNavLinks`) for anything that needs data in a Client Component (filters,
  cart, admin). SWR dedupes and caches by key, so multiple components asking for the same data in
  the same render share one request.
- `lib/cart-context.js` — cart/modal state (`useCart()`), persisted to `localStorage`.
  `getProductById` now reads from the shared product cache (`useProducts`) instead of a static
  array; `placeOrder` posts to `/api/orders`, which really checks and decrements stock now.
- `components/ProductCard.js` — the one interactive piece (click-to-open + photo) shared by every
  product grid; everything else in those grids is a plain Server Component.
- `components/` — one file per UI piece. Plain React, no UI library.
- `app/globals.css` — design tokens (colors, spacing) as CSS variables; fonts are loaded via
  `next/font` in `app/layout.js` and exposed as `--font-cormorant` / `--font-lora`.

## Images

`products.image_url` is ready for real photography, served through `next/image` (AVIF/WebP,
lazy-loaded) the moment it's set — until then, product cards fall back to the placeholder tiles
you see today. There's no Supabase Storage/Cloudinary wiring yet; add that when there's real
photography to upload, and point `image_url` at the resulting URL (see `next.config.js` for the
`*.supabase.co` Storage domain already allow-listed for `next/image`).

## Known gaps

- **No auth.** Admin routes (`/admin/*` and their `/api/*` mutation endpoints) are not
  authenticated — same as before, not a regression introduced here, but worth fixing before this
  goes live with real customer/order data.
- **Payments.** COD + WhatsApp need no gateway. Add JazzCash/Easypaisa once the merchant account
  is approved — both are hosted-checkout redirects + a server-side signature + a webhook that
  flips `pending → paid`. Never trust the browser redirect alone; always verify server-side.
- **Admin photo upload** is still a client-only preview (`FileReader` → data URL), not persisted —
  there's no image storage backend to upload to yet.
