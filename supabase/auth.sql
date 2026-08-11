-- ============================================================================
-- auth.sql — customer accounts + sessions, so a customer can log in once on a
-- device and see every order they've ever placed.
--
-- Run this ONCE in the Supabase SQL editor, AFTER admin.sql.
-- Same rules as admin.sql: only adds, safe to re-run, touches no existing row.
--
-- What it does:
--   1. customers          — one row per shopper, keyed on their phone number.
--                           Password hashing happens in the app (Node scrypt,
--                           lib/auth.js); only the hash ever reaches this table.
--   2. customer_sessions  — long-lived login sessions. The browser holds a
--                           random token in an httpOnly cookie; only its SHA-256
--                           hash is stored here, so a leaked database dump can't
--                           be used to log in as anyone.
--   3. orders.customer_id — links an order to the account that placed it. This
--                           is what "see your orders when you visit the site"
--                           reads, replacing the old order-number + phone form.
--   4. place_order()      — now records that customer_id, and always records
--                           channel 'website' (WhatsApp ordering is gone).
--   5. link_customer_orders() — when someone signs up with a phone number that
--                           already has orders against it, those older orders
--                           are adopted into the new account.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Customers
-- ----------------------------------------------------------------------------
-- `phone` is the login identifier, stored in one canonical form (digits only,
-- normalised by normalizePhone() in lib/auth.js) so 0300-1234567, 03001234567
-- and +923001234567 all resolve to the same account.
--
-- `address` is the last delivery address used, kept only to pre-fill checkout.
-- The address that a given order actually shipped to is snapshotted on the
-- order itself and is never rewritten from here.

create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null unique,
  name          text not null,
  email         text,
  address       text,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create index if not exists customers_email_idx on customers (email);

-- ----------------------------------------------------------------------------
-- 2. Sessions
-- ----------------------------------------------------------------------------
-- One row per logged-in device. Deliberately long-lived (a year, set by the
-- app) so a customer who checks out on their phone is still logged in the next
-- time they open the site on it — which is the whole point of this feature.
--
-- Only token_hash is stored. The raw token exists in exactly two places: the
-- customer's httpOnly cookie, and memory during the request that issued it.

create table if not exists customer_sessions (
  token_hash   text primary key,
  customer_id  uuid not null references customers (id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null
);

create index if not exists customer_sessions_customer_id_idx on customer_sessions (customer_id);
create index if not exists customer_sessions_expires_at_idx  on customer_sessions (expires_at);

-- ----------------------------------------------------------------------------
-- 3. Orders belong to a customer
-- ----------------------------------------------------------------------------
-- Nullable and `on delete set null`: the five orders that already exist have no
-- account yet (they get adopted the moment that phone number signs up — see
-- link_customer_orders below), and deleting an account must never delete the
-- sales history behind it.

alter table orders add column if not exists customer_id uuid references customers (id) on delete set null;

create index if not exists orders_customer_id_idx on orders (customer_id);

-- ----------------------------------------------------------------------------
-- 4. place_order(payload) — same transaction, now stamped with the account
-- ----------------------------------------------------------------------------
-- Only two changes from admin.sql's version: it reads payload->>'customerId'
-- onto the new column, and channel is hard-wired to 'website' now that
-- WhatsApp ordering has been removed from checkout. Stock locking, the
-- out_of_stock rollback and the snapshotting of order_lines are untouched.

create or replace function place_order(payload jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_line     jsonb;
  v_variant  product_variants%rowtype;
  v_product  products%rowtype;
  v_order_id text;
  v_customer uuid := nullif(payload->>'customerId', '')::uuid;
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
  insert into orders (customer_id, customer_name, phone, customer_email, address, channel, pay_method, status)
  values (
    v_customer,
    payload->'contact'->>'name',
    payload->'contact'->>'phone',
    nullif(payload->'contact'->>'email', ''),
    payload->'contact'->>'address',
    'website',
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
-- 5. Adopt a customer's older orders on signup
-- ----------------------------------------------------------------------------
-- Someone who ordered before accounts existed (or over the phone) signs up with
-- the same number and immediately sees that history. Matching is on the last 10
-- digits, so '0300 1234567', '03001234567' and '+92 300 1234567' all match the
-- same person regardless of how the number was typed at checkout.
--
-- Only ever claims orders that belong to nobody yet — it can't steal an order
-- already attached to another account.

create or replace function link_customer_orders(p_customer uuid, p_phone text)
returns integer
language plpgsql
as $$
declare
  v_tail  text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  v_count integer;
begin
  if length(v_tail) < 10 then
    return 0;
  end if;

  update orders
     set customer_id = p_customer
   where customer_id is null
     and right(regexp_replace(phone, '\D', '', 'g'), 10) = v_tail;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security
-- ----------------------------------------------------------------------------
-- Same posture as every other table: no policies, so only the service-role key
-- used by the server can read these. Password hashes and session tokens are the
-- last thing that should ever be reachable with a public key.

alter table customers         enable row level security;
alter table customer_sessions enable row level security;

commit;

-- ============================================================================
-- Housekeeping (optional): expired sessions are ignored by the app regardless,
-- but this clears them out if the table ever gets large.
--
--   delete from customer_sessions where expires_at < now();
-- ============================================================================
