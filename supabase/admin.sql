-- ============================================================================
-- admin.sql — brings an existing Elegance by Khadija database up to the schema
-- the admin console actually needs. Run this ONCE in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- Safe on the database you already have: it only ADDS what's missing and is
-- written to be re-runnable (every statement is `if not exists` / `or replace`
-- / `on conflict do nothing`). It does not drop or rewrite a single row of
-- your existing products, orders or settings.
--
-- What this file does, and why:
--   1. orders.customer_email        — the column the app already queries but
--                                     your database doesn't have yet. Without
--                                     it EVERY order query fails with
--                                     "column orders.customer_email does not
--                                     exist" (admin orders list, dashboard,
--                                     status changes, /track).
--   2. place_order()                — replaced with the version that stores
--                                     that email, so order confirmation mail
--                                     has somewhere to send to.
--   3. order_status_history         — the tracking timeline table + trigger,
--                                     plus a BACKFILL so orders placed before
--                                     today still show a timeline on /track.
--   4. admin_upsert_product()       — "Add Product" in the admin writes a
--                                     product AND its colourways in one
--                                     transaction (today it's two separate
--                                     inserts, so a failure halfway leaves a
--                                     product with no colourways), and it
--                                     finally saves the uploaded photo URL.
--   5. product-images bucket        — photo storage, with size/type limits
--                                     that match the upload API.
--   6. Row Level Security           — locked down. Every query in this app
--                                     runs server-side with the service-role
--                                     key, which bypasses RLS, so nothing in
--                                     the app changes; but the database stops
--                                     answering anyone else.
--
-- Nothing here changes the admin UI. It's all schema + server-side functions.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Orders: the missing customer_email column
-- ----------------------------------------------------------------------------
-- Optional at checkout (COD/WhatsApp orders in Pakistan very often have no
-- email), hence nullable. lib/data/orders.js selects it on every order read.

alter table orders add column if not exists customer_email text;

-- The admin orders screen filters by status and channel and sorts newest-first;
-- these indexes may already exist from 0001_init.sql, hence `if not exists`.
create index if not exists orders_status_idx     on orders (status);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_channel_idx    on orders (channel);


-- ----------------------------------------------------------------------------
-- 2. place_order(payload) — atomic order intake, now storing the email
-- ----------------------------------------------------------------------------
-- Unchanged behaviour except for customer_email: locks every variant row named
-- in the payload (consistent lock order, so two simultaneous orders can't
-- deadlock), verifies stock, then decrements and writes the order + its lines.
-- Raises 'out_of_stock:<productId>' — caught by app/api/orders/route.js and
-- turned into a 409 — and the whole transaction rolls back, so a partial order
-- can never be written.
--
-- payload shape:
-- {
--   "contact":   { "name": "...", "phone": "...", "email": "...", "address": "..." },
--   "payMethod": "cod" | "whatsapp" | "jazzcash" | "easypaisa",
--   "channel":   "website" | "whatsapp",
--   "lines":     [ { "productId": "...", "colorId": "...", "qty": 1 } ]
-- }

create or replace function place_order(payload jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_line     jsonb;
  v_variant  product_variants%rowtype;
  v_product  products%rowtype;
  v_order_id text;
  v_channel  text := coalesce(payload->>'channel', 'website');
begin
  if payload->'lines' is null or jsonb_array_length(payload->'lines') = 0 then
    raise exception 'invalid_order: no lines';
  end if;

  -- Pass 1: lock every variant up front and verify stock before writing.
  for v_line in
    select * from jsonb_array_elements(payload->'lines') order by (value->>'productId')
  loop
    select * into v_variant
      from product_variants
      where id = v_line->>'colorId'
        and product_id = v_line->>'productId'
      for update;

    if not found then
      raise exception 'invalid_order: unknown variant %', v_line->>'colorId';
    end if;

    if v_variant.stock < (v_line->>'qty')::int then
      raise exception 'out_of_stock:%', v_line->>'productId';
    end if;
  end loop;

  -- Pass 2: everything is locked and confirmed in stock — decrement + write.
  insert into orders (customer_name, phone, customer_email, address, channel, pay_method, status)
  values (
    payload->'contact'->>'name',
    payload->'contact'->>'phone',
    nullif(payload->'contact'->>'email', ''),
    payload->'contact'->>'address',
    v_channel,
    payload->>'payMethod',
    'pending'
  )
  returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(payload->'lines')
  loop
    select * into v_product from products         where id = v_line->>'productId';
    select * into v_variant from product_variants where id = v_line->>'colorId';

    update product_variants
      set stock = stock - (v_line->>'qty')::int
      where id = v_variant.id;

    -- product_name / color_label / price are snapshotted so a later product
    -- edit (or deletion) never rewrites a historical order.
    insert into order_lines (order_id, product_id, variant_id, product_name, color_label, qty, price)
    values (
      v_order_id,
      v_product.id,
      v_variant.id,
      v_product.name,
      v_variant.label,
      (v_line->>'qty')::int,
      v_product.price
    );
  end loop;

  return jsonb_build_object('orderNumber', v_order_id, 'status', 'pending');
end;
$$;


-- ----------------------------------------------------------------------------
-- 3. Order status history — the /track timeline + status follow-up emails
-- ----------------------------------------------------------------------------

create table if not exists order_status_history (
  id         bigserial primary key,
  order_id   text not null references orders (id) on delete cascade,
  status     text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx
  on order_status_history (order_id, created_at);

-- A trigger (not application code) writes this, so the timeline stays correct
-- no matter which path touches `orders` — place_order() today, a manually
-- entered WhatsApp order tomorrow.
create or replace function log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    insert into order_status_history (order_id, status) values (new.id, new.status);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into order_status_history (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_status_history_trigger on orders;
create trigger orders_status_history_trigger
  after insert or update on orders
  for each row execute function log_order_status_change();

-- Backfill: orders that already existed before the trigger did have no history
-- at all, which would show as an empty timeline on /track. Seed one entry per
-- such order, dated when the order was placed.
insert into order_status_history (order_id, status, created_at)
select o.id, o.status, o.created_at
  from orders o
 where not exists (
   select 1 from order_status_history h where h.order_id = o.id
 );


-- ----------------------------------------------------------------------------
-- 4. admin_upsert_product(payload) — "Add Product" / product edits, atomically
-- ----------------------------------------------------------------------------
-- Writes the product row and all of its colourways in ONE transaction. Used by
-- lib/data/products.js createProduct(). Re-running it for an existing id
-- updates that product instead of failing, so it doubles as the save path for
-- any future edit screen.
--
-- payload shape (exactly what the admin form already builds):
-- {
--   "id": "p3f9a1", "name": "Noorbano", "fabric": "Lawn", "pieces": "3 Piece",
--   "price": 6800, "compareAt": null, "category": "lawn",
--   "image": "https://<project>.supabase.co/storage/v1/object/public/product-images/...webp",
--   "colors": [ { "id": "c81ba2", "hex": "#8a4b3a", "label": "Rosewood", "stock": 4 } ]
-- }

create or replace function admin_upsert_product(payload jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_id       text := payload->>'id';
  v_name     text := nullif(trim(payload->>'name'), '');
  v_category text := nullif(payload->>'category', '');
  v_color    jsonb;
  v_keep     text[] := array[]::text[];
begin
  if v_id is null or v_id = '' then
    raise exception 'invalid_product: id required';
  end if;
  if v_name is null then
    raise exception 'invalid_product: name required';
  end if;

  -- products.category is a foreign key to categories(id). If the admin sends a
  -- category that no longer exists (deleted in Settings while the form was
  -- open), store null rather than rejecting the whole save — an untagged
  -- product is recoverable from the UI, a lost one isn't.
  if v_category is not null
     and not exists (select 1 from categories c where c.id = v_category) then
    v_category := null;
  end if;

  insert into products (id, name, fabric, pieces, price, compare_at, category, image_url)
  values (
    v_id,
    v_name,
    coalesce(nullif(payload->>'fabric', ''), 'Lawn'),
    coalesce(nullif(payload->>'pieces', ''), '3 Piece'),
    coalesce((payload->>'price')::numeric, 0),
    (payload->>'compareAt')::numeric,          -- null when absent: not on sale
    v_category,
    nullif(payload->>'image', '')
  )
  -- On update, a key the payload didn't mention keeps its current value —
  -- nothing gets blanked (or reset to a default) just because it was absent.
  on conflict (id) do update set
    name       = excluded.name,
    fabric     = coalesce(nullif(payload->>'fabric', ''), products.fabric),
    pieces     = coalesce(nullif(payload->>'pieces', ''), products.pieces),
    price      = coalesce((payload->>'price')::numeric, products.price),
    compare_at = case when jsonb_exists(payload, 'compareAt')
                      then (payload->>'compareAt')::numeric
                      else products.compare_at end,
    category   = case when jsonb_exists(payload, 'category')
                      then v_category
                      else products.category end,
    image_url  = coalesce(excluded.image_url, products.image_url);

  -- Colourways. Stock lives here, never on the product, so two customers can't
  -- oversell the same one-of-a-kind piece.
  for v_color in select * from jsonb_array_elements(coalesce(payload->'colors', '[]'::jsonb))
  loop
    continue when nullif(v_color->>'id', '') is null;
    v_keep := v_keep || (v_color->>'id');

    insert into product_variants (id, product_id, hex, label, stock)
    values (
      v_color->>'id',
      v_id,
      coalesce(nullif(v_color->>'hex', ''), '#8a4b3a'),
      coalesce(nullif(v_color->>'label', ''), 'Colour'),
      greatest(coalesce((v_color->>'stock')::int, 0), 0)
    )
    on conflict (id) do update set
      hex   = excluded.hex,
      label = excluded.label,
      stock = excluded.stock;
  end loop;

  -- Colourways removed in the form are removed here too — but only when the
  -- payload actually carried a colours list. A payload without one is an edit
  -- to other fields, not an instruction to delete every colourway.
  if jsonb_exists(payload, 'colors') then
    delete from product_variants
      where product_id = v_id
        and not (id = any (v_keep));
  end if;

  return jsonb_build_object('id', v_id);
end;
$$;


-- ----------------------------------------------------------------------------
-- 5. Product photo storage
-- ----------------------------------------------------------------------------
-- Public bucket: photos are served straight off Supabase's CDN
-- (/storage/v1/object/public/product-images/<file>), which is the URL shape
-- already allow-listed in next.config.js. Uploads all go through
-- app/api/uploads/product-image with the service-role key (which bypasses RLS),
-- after sharp has resized them to fit 1200x1500 and re-encoded them to WebP.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Belt and braces: even if something bypassed the API's own 8MB check, the
-- storage layer refuses anything larger or of an unexpected type.
update storage.buckets
   set public            = true,
       file_size_limit   = 8388608,  -- 8MB, same limit as the upload route
       allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
 where id = 'product-images';

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');


-- ----------------------------------------------------------------------------
-- 6. Row Level Security — deny by default
-- ----------------------------------------------------------------------------
-- Every database call in this app happens server-side through
-- lib/supabase/server.js with the service-role key, and the service_role
-- postgres role bypasses RLS. So enabling RLS with no policies changes nothing
-- about how the app behaves, and means that if the project's public anon key is
-- ever used from a browser (or leaks), it returns nothing instead of your whole
-- orders table.
--
-- NOTE: this is not admin authentication. /admin/* is still unauthenticated —
-- anyone with the URL can open it. That needs a login in front of the app
-- itself; see the note in README.md.

alter table categories           enable row level security;
alter table nav_links            enable row level security;
alter table products             enable row level security;
alter table product_variants     enable row level security;
alter table orders               enable row level security;
alter table order_lines          enable row level security;
alter table order_status_history enable row level security;

commit;

-- ============================================================================
-- After running this, the following admin actions are fully wired end to end:
--   Dashboard   — revenue, order counts, status/channel split, top products
--   Orders      — list, search, filter, change status (+ follow-up email)
--   Products    — add product with photo & colourways, edit price, edit
--                 category, edit per-colourway stock, replace photo, delete
--   Settings    — add/edit/delete nav links and categories
--   Storefront  — checkout writes a real order and decrements real stock;
--                 /track shows the full status timeline
-- ============================================================================
