# Elegance by Khadija — Next.js storefront

A Next.js (App Router) storefront backed by Supabase: home, product quick-view, cart drawer,
checkout with Cash on Delivery / JazzCash / Easypaisa, customer accounts with order tracking, and
an admin console for stock, orders, and nav/category settings.

## Set up Supabase (required — the app won't build or run without this)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run, in order: `supabase/migrations/0001_init.sql`,
   `supabase/migrations/0002_storage.sql`, `supabase/migrations/0003_order_tracking.sql`, then
   `supabase/seed.sql` (seeds the same 6 products / 5 orders the app used to ship as mock data).
3. In Project Settings → API, copy the **Project URL** and the **service_role** key.
4. `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY`.

5. Run `supabase/admin.sql`, then `supabase/auth.sql`, in that order.

**Already have a database from an earlier version?** Run `supabase/admin.sql` and then
`supabase/auth.sql` — not the migrations again (re-running `0001_init.sql` aborts on
`create table … already exists`, which is why a database set up early can be missing
`orders.customer_email` and the tracking trigger). Both files only add what's missing, back-fill
existing rows where it matters, and are safe to run more than once.

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
- `lib/auth.js` + `lib/data/customers.js` + `app/api/auth/*` — customer accounts (see **Accounts**
  below). `app/track/` lists the logged-in customer's own orders and their status timelines.
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

Optional, and there are two ways to send. Whichever is configured wins; Gmail takes priority.

**Gmail (no domain required).** Turn on 2-Step Verification for your Google account, create an App
Password under *Security → App passwords*, and set `GMAIL_USER` + `GMAIL_APP_PASSWORD`. Sends to
any recipient, ~500/day, and customers see your Gmail address as the sender. Good enough to run a
shop on before you own a domain.

**Resend (for launch).** Set `RESEND_API_KEY` + `EMAIL_FROM`. Note that Resend will only deliver to
your own account address until you add a domain at [resend.com/domains](https://resend.com/domains)
and add its DNS records — until then `EMAIL_FROM` must be `onboarding@resend.dev`.

Two emails fire automatically:
- **Order confirmation**, right after checkout — only if the customer entered an email (it's an
  optional field; COD orders in Pakistan very often don't have one).
- **Status follow-up**, whenever an admin changes an order's status in `/admin/orders`.

With no provider configured, both quietly no-op (logged to the console) — an unconfigured or down
email provider never blocks placing or updating an order.

## Accounts

Customers log in with **their phone number and a password** — there is no separate sign-up step to
get through before buying. Checkout doubles as registration: a first-time buyer types the details
they'd have to type anyway plus a password, and `POST /api/auth/signup` creates the account before
`POST /api/orders` places the order against it. If that number already has an account, the checkout
form switches to "enter your password to continue" rather than turning them away.

- Sessions last a year in an httpOnly cookie, so a customer stays logged in on the device they
  ordered from. Only a SHA-256 of the session token is stored (`customer_sessions`); passwords are
  scrypt-hashed by `lib/auth.js` and only the hash reaches the database.
- Phone numbers are normalised (`0300 1234567`, `+92 300 1234567` and `03001234567` are one
  account), which is also how `link_customer_orders()` adopts orders placed before the account
  existed.
- Orders are read back scoped to the session's `customer_id` — `/api/account/orders` never takes an
  id from the request, so there's nothing to tamper with.
- `/login` exists for coming back on a new device or after logging out.

## Known gaps

- **Admin is still unauthenticated.** `/admin/*` and its `/api/*` mutation endpoints have no login
  — customer accounts do not cover the admin console. Worth fixing before this goes live.
- **Payments.** COD needs no gateway. JazzCash and Easypaisa are selectable at checkout but are
  settled manually today — wire the real gateways once the merchant account is approved (hosted
  checkout redirect + server-side signature + a webhook that flips `pending → paid`). Never trust
  the browser redirect alone; always verify server-side.
