-- Elegance by Khadija — initial schema.
-- Run this in the Supabase SQL editor (or `supabase db push`) before anything else.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Site config: nav bar links + category taxonomy (app/admin/settings)
-- ---------------------------------------------------------------------------

create table categories (
  id    text primary key,
  label text not null
);

create table nav_links (
  id         text primary key,
  label      text not null,
  href       text not null,
  sort_order int not null default 999
);

-- ---------------------------------------------------------------------------
-- Catalogue: product (shell) + product_variants (the sellable thing — a
-- colourway, with its own stock). Stock lives on the variant, never the
-- product, so two customers can't oversell the same one-of-a-kind colourway.
-- ---------------------------------------------------------------------------

create table products (
  id         text primary key,
  name       text not null,
  fabric     text not null,
  pieces     text not null,
  price      numeric(10, 2) not null check (price >= 0),
  compare_at numeric(10, 2) check (compare_at is null or compare_at >= 0),
  category   text references categories (id) on delete set null,
  arrived_at date not null default current_date,
  image_url  text,
  on_sale    boolean generated always as (compare_at is not null and compare_at > price) stored
);

create index products_category_idx on products (category);
create index products_fabric_idx on products (fabric);
create index products_price_idx on products (price);
create index products_arrived_at_idx on products (arrived_at desc);
create index products_on_sale_idx on products (on_sale) where on_sale;

create table product_variants (
  id         text primary key,
  product_id text not null references products (id) on delete cascade,
  hex        text not null,
  label      text not null,
  stock      int not null default 0 check (stock >= 0)
);

create index product_variants_product_id_idx on product_variants (product_id);

-- ---------------------------------------------------------------------------
-- Orders: pending -> confirmed -> dispatched -> delivered -> returned.
-- order_lines snapshots product_name/color_label/price at order time so a
-- later product edit or deletion never changes a historical order.
-- ---------------------------------------------------------------------------

create sequence orders_seq start 10440;

create table orders (
  id            text primary key default ('EK-' || nextval('orders_seq')::text),
  created_at    timestamptz not null default now(),
  customer_name text not null,
  phone         text not null,
  address       text,
  channel       text not null default 'website' check (channel in ('website', 'whatsapp')),
  pay_method    text not null check (pay_method in ('cod', 'whatsapp', 'jazzcash', 'easypaisa')),
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'dispatched', 'delivered', 'returned'))
);

create index orders_status_idx on orders (status);
create index orders_created_at_idx on orders (created_at desc);

create table order_lines (
  id           bigserial primary key,
  order_id     text not null references orders (id) on delete cascade,
  product_id   text references products (id) on delete set null,
  variant_id   text references product_variants (id) on delete set null,
  product_name text not null,
  color_label  text not null,
  qty          int not null check (qty > 0),
  price        numeric(10, 2) not null check (price >= 0)
);

create index order_lines_order_id_idx on order_lines (order_id);

-- ---------------------------------------------------------------------------
-- place_order(payload) — atomic order intake.
--
-- Runs as a single Postgres transaction: locks every variant row named in
-- the payload, checks stock, decrements it, inserts the order + its lines.
-- Raises 'out_of_stock:<productId>' (caught by app/api/orders/route.js and
-- turned into a 409) if any line can't be fulfilled — the whole transaction
-- rolls back automatically, so a partial order never gets written.
--
-- payload shape:
-- {
--   "contact": { "name": "...", "phone": "...", "address": "..." },
--   "payMethod": "cod" | "whatsapp" | "jazzcash" | "easypaisa",
--   "channel": "website" | "whatsapp",
--   "lines": [ { "productId": "...", "colorId": "...", "qty": 1 } ]
-- }
-- ---------------------------------------------------------------------------

create or replace function place_order(payload jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_line       jsonb;
  v_variant    product_variants%rowtype;
  v_product    products%rowtype;
  v_order_id   text;
  v_channel    text := coalesce(payload->>'channel', 'website');
begin
  if jsonb_array_length(payload->'lines') = 0 then
    raise exception 'invalid_order: no lines';
  end if;

  -- Pass 1: lock every variant row up front (consistent lock order = id,
  -- avoids deadlocks between two orders touching the same variants) and
  -- verify stock before writing anything.
  for v_line in select * from jsonb_array_elements(payload->'lines') order by (value->>'productId')
  loop
    select * into v_variant
      from product_variants
      where id = v_line->>'colorId' and product_id = v_line->>'productId'
      for update;

    if not found then
      raise exception 'invalid_order: unknown variant %', v_line->>'colorId';
    end if;

    if v_variant.stock < (v_line->>'qty')::int then
      raise exception 'out_of_stock:%', v_line->>'productId';
    end if;
  end loop;

  -- Pass 2: everything is locked and confirmed in stock — decrement + write.
  insert into orders (customer_name, phone, address, channel, pay_method, status)
  values (
    payload->'contact'->>'name',
    payload->'contact'->>'phone',
    payload->'contact'->>'address',
    v_channel,
    payload->>'payMethod',
    'pending'
  )
  returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(payload->'lines')
  loop
    select * into v_product from products where id = v_line->>'productId';
    select * into v_variant from product_variants where id = v_line->>'colorId';

    update product_variants
      set stock = stock - (v_line->>'qty')::int
      where id = v_variant.id;

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
