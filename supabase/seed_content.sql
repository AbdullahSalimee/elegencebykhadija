-- Seeds the storefront content tables with exactly what lib/site-config.js used
-- to hard-code, so the site looks identical the moment it starts reading from
-- the database. Run after 0004_site_content.sql.
--
-- Re-runnable: every insert is `on conflict do nothing`, so running it twice
-- won't duplicate rows or overwrite copy the shop owner has since edited in
-- /admin/content.

-- ---------------------------------------------------------------------------
-- Announcement bar + utility row
-- ---------------------------------------------------------------------------

insert into announcements (id, message, sort_order) values
  ('cod',      'Cash on Delivery available on orders up to Rs. 25,000', 1),
  ('shipping', 'Free shipping on all prepaid orders across Pakistan',   2)
on conflict (id) do nothing;

-- "Track Your Order" points at the real /track page — it pointed at /contact
-- back when order tracking didn't exist yet.
insert into utility_links (id, label, href, sort_order) values
  ('track',   'Track Your Order', '/track',   1),
  ('help',    'Help',             '/contact', 2),
  ('contact', 'Contact Us',       '/contact', 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Mega menu
-- ---------------------------------------------------------------------------

-- Upsert rather than plain insert: 0001's seed.sql may already have created
-- these rows, and they need the redesign's ordering, accent flag and feature
-- card. Only the columns this redesign owns are overwritten.
insert into nav_links (id, label, href, sort_order, accent, feature_eyebrow, feature_title, feature_href) values
  ('women',        'Women',       '/shop',         1, false, 'The Season''s Last Sale', 'Up to 50% off unstitched', '/sale'),
  ('new-in',       'New In',      '/new-in',       2, false, null, null, null),
  ('unstitched',   'Unstitched',  '/shop',         3, false, null, null, null),
  ('fabric-guide', 'Fabric Guide','/fabric-guide', 4, false, null, null, null),
  ('sale',         'Sale',        '/sale',         5, true,  null, null, null)
on conflict (id) do update set
  label           = excluded.label,
  href            = excluded.href,
  sort_order      = excluded.sort_order,
  accent          = excluded.accent,
  feature_eyebrow = excluded.feature_eyebrow,
  feature_title   = excluded.feature_title,
  feature_href    = excluded.feature_href;

-- 0001's seed.sql put Contact in the header. The redesign moves it to the
-- utility row above the logo (seeded above), so it would otherwise appear
-- twice in the chrome.
delete from nav_links where id = 'contact';

insert into nav_columns (id, nav_link_id, heading, sort_order) values
  ('women-eastern', 'women', 'Eastern',        1),
  ('women-fabric',  'women', 'Shop by Fabric', 2),
  ('women-help',    'women', 'Buying Guides',  3)
on conflict (id) do nothing;

insert into nav_column_links (column_id, label, href, sort_order)
select v.column_id, v.label, v.href, v.sort_order
from (values
  ('women-eastern', 'View All',          '/shop',         1),
  ('women-eastern', 'Unstitched Suits',  '/shop',         2),
  ('women-eastern', 'New Arrivals',      '/new-in',       3),
  ('women-eastern', 'On Sale',           '/sale',         4),
  ('women-fabric',  'Lawn',              '/shop',         1),
  ('women-fabric',  'Karandi',           '/shop',         2),
  ('women-fabric',  'Silk',              '/shop',         3),
  ('women-fabric',  'Fabric Guide',      '/fabric-guide', 4),
  ('women-help',    'How Much Fabric?',  '/fabric-guide', 1),
  ('women-help',    'Care & Washing',    '/fabric-guide', 2),
  ('women-help',    'Talk to Us',        '/contact',      3)
) as v(column_id, label, href, sort_order)
-- bigserial pk means there's no natural conflict target; guard on the content
-- instead so a second run doesn't duplicate the menu.
where not exists (
  select 1 from nav_column_links n
  where n.column_id = v.column_id and n.label = v.label
);

-- ---------------------------------------------------------------------------
-- Homepage
-- ---------------------------------------------------------------------------

insert into hero_slides (id, eyebrow, title, body, cta_label, cta_href, image, mobile_image, sort_order) values
  ('sale', 'The Season''s Last Sale', 'Up to 50% Off', 'Lawn, karandi and silk — the last of the season, while the shades last.', 'Shop the Sale', '/sale', '/hero1.webp', '/mobilehero1.webp', 1),
  ('new',  'Just Arrived', 'Unstitched. Unmatched.', 'Three metres of possibility, cut from the finest mills and ready for your tailor.', 'Shop New In', '/new-in', '/hero.webp', '/mobilehero.webp', 2)
on conflict (id) do nothing;

insert into category_tiles (id, label, href, image, sort_order) values
  ('lawn',        'Lawn',    '/shop',   '/products/zarnaab.webp',   1),
  ('karandi',     'Karandi', '/shop',   '/products/anaya.webp',     2),
  ('silk',        'Silk',    '/shop',   '/products/rania.webp',     3),
  ('new-in',      'New In',  '/new-in', '/products/meherbano.webp', 4),
  ('three-piece', '3 Piece', '/shop',   '/products/sana.webp',      5),
  ('sale',        'Sale',    '/sale',   '/products/iqra.webp',      6)
on conflict (id) do nothing;

insert into collection_blocks (id, heading, caption, href, image, sort_order) values
  ('zarnaab',   'Pret',              'Zarnaab — Lawn SS26 Vol-II', '/shop', '/products/zarnaab.webp',   1),
  ('rania',     'Luxury Pret',       'Rania — Silk Festive 26',    '/shop', '/products/rania.webp',     2),
  ('anaya',     'Everyday Karandi',  'Anaya — Karandi Vol-I',      '/shop', '/products/anaya.webp',     3),
  ('meherbano', 'Summer Lawn',       'Meherbano — Lawn Vol-II',    '/shop', '/products/meherbano.webp', 4),
  ('sana',      'Occasion Silk',     'Sana — Silk Noir',           '/shop', '/products/sana.webp',      5),
  ('iqra',      'The Daily Edit',    'Iqra — Lawn Essentials',     '/shop', '/products/iqra.webp',      6)
on conflict (id) do nothing;

insert into promo_banners (id, eyebrow, title, body, cta_label, cta_href, image, sort_order) values
  ('fabric',   'Not sure how much to buy?', 'The Fabric Guide', 'Lawn, karandi and silk compared — weight, season, drape and care.', 'Read the Guide', '/fabric-guide', '/products/meherbano.webp', 1),
  ('whatsapp', 'Order the easy way',        'Buy on WhatsApp',  'Send us a shade and a shirt length. We''ll confirm stock and ship it COD.', 'Start a Chat', '/contact', '/products/sana.webp', 2)
on conflict (id) do nothing;

insert into trust_items (id, title, body, sort_order) values
  ('cod',       'Cash on Delivery',        'Pay at your doorstep, no card needed',            1),
  ('track',     'Track Every Order',       'Follow it from your account, start to finish',    2),
  ('delivery',  'Pakistan-wide Delivery',  '3–7 business days, tracked',                      3),
  ('exchanges', 'Easy Exchanges',          'Wrong shade or size? We''ll sort it',             4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Footer
-- ---------------------------------------------------------------------------

insert into footer_columns (id, heading, sort_order) values
  ('company', 'Company', 1),
  ('help',    'Help',    2),
  ('shop',    'Shop',    3)
on conflict (id) do nothing;

insert into footer_links (column_id, label, href, sort_order)
select v.column_id, v.label, v.href, v.sort_order
from (values
  ('company', 'About Us',             '/contact',      1),
  ('company', 'Fabric Guide',         '/fabric-guide', 2),
  ('company', 'Contact Us',           '/contact',      3),
  ('help',    'FAQs',                 '/contact',      1),
  ('help',    'Shipping & Returns',   '/contact',      2),
  ('help',    'Track Your Order',     '/track',        3),
  ('help',    'Size & Fabric Guide',  '/fabric-guide', 4),
  ('shop',    'New In',               '/new-in',       1),
  ('shop',    'Unstitched Suits',     '/shop',         2),
  ('shop',    'Sale',                 '/sale',         3)
) as v(column_id, label, href, sort_order)
where not exists (
  select 1 from footer_links f
  where f.column_id = v.column_id and f.label = v.label
);

insert into shipping_regions (id, label, sort_order) values
  ('pk',   'Pakistan',       1),
  ('uk',   'United Kingdom', 2),
  ('us',   'United States',  3),
  ('uae',  'UAE',            4),
  ('rest', 'Rest of World',  5)
on conflict (id) do nothing;
