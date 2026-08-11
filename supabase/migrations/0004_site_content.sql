-- Storefront content — everything the redesigned homepage and chrome render
-- that isn't a product or an order. Run after 0001/0002/0003.
--
-- Before this migration these lived as hand-written constants in
-- lib/site-config.js, which meant the shop owner needed a developer (and a
-- redeploy) to change a hero photograph or a sale banner. Every table here is
-- backed by an admin panel at /admin/content.
--
-- Written to be re-runnable: every statement is `if not exists`, so running it
-- twice is harmless. Seeding lives in supabase/seed_content.sql so this file
-- stays purely structural.
--
-- Two shapes repeat below:
--   * flat ordered lists  — announcements, hero slides, tiles, promos
--   * parent/child pairs  — nav columns + links, footer columns + links
-- `sort_order` drives display order everywhere; `active` lets the owner pull a
-- slide or banner off the site without deleting the row and losing the copy.

-- ---------------------------------------------------------------------------
-- Announcement bar + utility row (components/AnnounceBar.js, Nav.js)
-- ---------------------------------------------------------------------------

create table if not exists announcements (
  id         text primary key,
  message    text not null,
  sort_order int not null default 999,
  active     boolean not null default true
);

create table if not exists utility_links (
  id         text primary key,
  label      text not null,
  href       text not null,
  sort_order int not null default 999
);

-- ---------------------------------------------------------------------------
-- Mega menu (components/Nav.js)
--
-- Extends the existing nav_links table rather than replacing it: a row with no
-- nav_columns is a plain link, exactly as before. `accent` is the red "Sale"
-- treatment; the three feature_* columns are the promo card that sits at the
-- right-hand end of an open panel.
-- ---------------------------------------------------------------------------

alter table nav_links add column if not exists accent          boolean not null default false;
alter table nav_links add column if not exists feature_eyebrow text;
alter table nav_links add column if not exists feature_title   text;
alter table nav_links add column if not exists feature_href    text;

create table if not exists nav_columns (
  id           text primary key,
  nav_link_id  text not null references nav_links (id) on delete cascade,
  heading      text not null,
  sort_order   int not null default 999
);

create table if not exists nav_column_links (
  id         bigserial primary key,
  column_id  text not null references nav_columns (id) on delete cascade,
  label      text not null,
  href       text not null,
  sort_order int not null default 999
);

create index if not exists nav_columns_link_idx on nav_columns (nav_link_id, sort_order);
create index if not exists nav_column_links_col_idx on nav_column_links (column_id, sort_order);

-- ---------------------------------------------------------------------------
-- Homepage: hero carousel, category tiles, collection blocks, promo banners
-- ---------------------------------------------------------------------------

-- image = landscape crop for desktop, mobile_image = portrait crop for phones.
-- Genuinely different photographs, not one frame resized: a landscape shot
-- squeezed into a phone leaves the model tiny and puts her face behind the
-- header.
create table if not exists hero_slides (
  id           text primary key,
  eyebrow      text,
  title        text not null,
  body         text,
  cta_label    text,
  cta_href     text,
  image        text,
  mobile_image text,
  sort_order   int not null default 999,
  active       boolean not null default true
);

create table if not exists category_tiles (
  id         text primary key,
  label      text not null,
  href       text not null,
  image      text,
  sort_order int not null default 999,
  active     boolean not null default true
);

create table if not exists collection_blocks (
  id         text primary key,
  heading    text not null,
  caption    text,
  href       text not null,
  image      text,
  sort_order int not null default 999,
  active     boolean not null default true
);

create table if not exists promo_banners (
  id         text primary key,
  eyebrow    text,
  title      text not null,
  body       text,
  cta_label  text,
  cta_href   text,
  image      text,
  sort_order int not null default 999,
  active     boolean not null default true
);

-- The four reassurances under the homepage collections (components/TrustStrip).
create table if not exists trust_items (
  id         text primary key,
  title      text not null,
  body       text not null,
  sort_order int not null default 999
);

-- ---------------------------------------------------------------------------
-- Footer (components/Footer.js)
-- ---------------------------------------------------------------------------

create table if not exists footer_columns (
  id         text primary key,
  heading    text not null,
  sort_order int not null default 999
);

create table if not exists footer_links (
  id         bigserial primary key,
  column_id  text not null references footer_columns (id) on delete cascade,
  label      text not null,
  href       text not null,
  sort_order int not null default 999
);

create index if not exists footer_links_col_idx on footer_links (column_id, sort_order);

-- Ship-to list in the footer bar.
create table if not exists shipping_regions (
  id         text primary key,
  label      text not null,
  sort_order int not null default 999
);
