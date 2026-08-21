-- Shop details: the storefront copy that isn't a list.
--
-- 0004 moved every repeating block (slides, tiles, footer columns) into its own
-- table, but the single values stayed hard-coded in the components — the
-- WhatsApp number, the shop's email and address, the opening hours, the social
-- links, the newsletter blurb. So the footer said one phone number and the
-- contact page said another, and neither could be changed without a deploy.
--
-- One row, typed columns, rather than a key/value table: the admin form maps
-- straight onto the columns, and a missing setting is a null with a known
-- meaning instead of an absent row nobody notices.

create table if not exists site_settings (
  -- Enforces exactly one row: the only value that passes the check is true, and
  -- it's the primary key, so a second insert collides with the first.
  id                 boolean primary key default true check (id),

  -- Contact. whatsapp_number is the wa.me digits (international, no + or
  -- spaces); contact_phone is how it's written for people to read.
  whatsapp_number    text,
  contact_phone      text,
  contact_email      text,
  address            text,
  hours              text,

  -- Socials. Blank means "we're not on it" and the link is left out entirely,
  -- rather than rendering a dead anchor.
  facebook_url       text,
  instagram_url      text,
  youtube_url        text,
  tiktok_url         text,

  -- Storefront copy that had no home.
  newsletter_heading text,
  newsletter_blurb   text,
  carousel_title     text,
  footer_note        text,

  updated_at         timestamptz not null default now()
);

alter table site_settings enable row level security;

-- Seeded with exactly what the components hard-coded, so the site reads the
-- same the moment it starts loading from here. `on conflict do nothing` keeps a
-- second run from overwriting details the shop owner has since edited.
insert into site_settings (
  id,
  whatsapp_number, contact_phone, contact_email, address, hours,
  instagram_url, facebook_url,
  newsletter_heading, newsletter_blurb, carousel_title, footer_note
) values (
  true,
  '923233002222',
  '+92 323 3002222',
  'hello@elegancebykhadija.pk',
  'Lahore, Pakistan',
  'Mon – Sat, 11am – 8pm PKT',
  null,
  null,
  'Join the List',
  'New arrivals, restocks and sale access before anyone else.',
  'Pret SS26 Vol II',
  'ELEGANCE by Khadija © 2026. All rights reserved.'
)
on conflict (id) do nothing;
