-- Seeds the schema with the same data the app used to ship as mock JS arrays
-- (lib/products.js, lib/orders.js, lib/site-config.js). Run after 0001_init.sql.

insert into categories (id, label) values
  ('lawn', 'Lawn'),
  ('silk', 'Silk'),
  ('karandi', 'Karandi');

insert into nav_links (id, label, href, sort_order) values
  ('new-in', 'New In', '/new-in', 1),
  ('unstitched', 'Unstitched Suits', '/shop', 2),
  ('fabric-guide', 'Fabric Guide', '/fabric-guide', 3),
  ('sale', 'Sale', '/sale', 4),
  ('contact', 'Contact', '/contact', 5);

insert into products (id, name, fabric, pieces, price, compare_at, category, arrived_at) values
  ('zarnaab',   'Zarnaab',   'Lawn',    '3 Piece', 6200, 7800, 'lawn',    '2026-07-29'),
  ('rania',     'Rania',     'Silk',    '3 Piece', 8900, null, 'silk',    '2026-07-22'),
  ('anaya',     'Anaya',     'Karandi', '2 Piece', 5400, 6600, 'karandi', '2026-06-30'),
  ('meherbano', 'Meherbano', 'Lawn',    '3 Piece', 6750, null, 'lawn',    '2026-07-31'),
  ('sana',      'Sana',      'Silk',    '3 Piece', 9200, 11000, 'silk',   '2026-07-10'),
  ('iqra',      'Iqra',      'Lawn',    '2 Piece', 4950, null, 'lawn',    '2026-06-18');

insert into product_variants (id, product_id, hex, label, stock) values
  ('emerald', 'zarnaab',   '#3f5d43', 'Emerald Vine',     12),
  ('rust',    'zarnaab',   '#8a4b3a', 'Rust',              6),
  ('gold',    'zarnaab',   '#c9a25a', 'Gold',              0),

  ('rose',    'rania',     '#7a3b46', 'Rustic Rose',       8),
  ('ink',     'rania',     '#2e2a3d', 'Ink',               5),
  ('tan',     'rania',     '#b9895a', 'Tan',               3),

  ('indigo',  'anaya',     '#2f3b57', 'Indigo Bloom',     15),
  ('olive',   'anaya',     '#6b5b3e', 'Olive',             9),
  ('maroon',  'anaya',     '#8f2f3a', 'Maroon',            2),

  ('saffron', 'meherbano', '#c47f2c', 'Saffron Paisley',   7),
  ('pine',    'meherbano', '#41504a', 'Pine',             11),
  ('brick',   'meherbano', '#7a2f2f', 'Brick',             4),

  ('onyx',    'sana',      '#1f1e22', 'Onyx Floral',       3),
  ('walnut',  'sana',      '#5c3b2e', 'Walnut',            6),
  ('brass',   'sana',      '#94793f', 'Brass',             0),

  ('blush',   'iqra',      '#c98b8f', 'Blush Botanical',  10),
  ('sage',    'iqra',      '#4a5d4f', 'Sage',             14),
  ('sand',    'iqra',      '#d9c19a', 'Sand',              5);

insert into orders (id, created_at, customer_name, phone, channel, pay_method, status) values
  ('EK-10432', '2026-08-01', 'Ayesha Raza',  '0301 2345678', 'website',  'cod',      'pending'),
  ('EK-10431', '2026-08-01', 'Mahnoor Khan', '0333 1122334', 'whatsapp', 'whatsapp', 'confirmed'),
  ('EK-10428', '2026-07-30', 'Sadia Malik',  '0345 9988776', 'website',  'cod',      'dispatched'),
  ('EK-10420', '2026-07-27', 'Fatima Noor',  '0312 4455667', 'website',  'cod',      'delivered'),
  ('EK-10415', '2026-07-24', 'Zara Ahmed',   '0300 7788990', 'whatsapp', 'whatsapp', 'returned');

insert into order_lines (order_id, product_id, variant_id, product_name, color_label, qty, price) values
  ('EK-10432', 'zarnaab',   'emerald', 'Zarnaab',   'Emerald Vine', 1, 6200),
  ('EK-10431', 'sana',      'onyx',    'Sana',      'Onyx Floral',  1, 9200),
  ('EK-10431', 'iqra',      'sage',    'Iqra',      'Sage',         1, 4950),
  ('EK-10428', 'anaya',     'indigo',  'Anaya',     'Indigo Bloom', 2, 5400),
  ('EK-10420', 'meherbano', 'pine',    'Meherbano', 'Pine',         1, 6750),
  ('EK-10415', 'rania',     'ink',     'Rania',     'Ink',          1, 8900);

-- Keep the id sequence ahead of the highest seeded order so the next
-- website order doesn't collide with these.
select setval('orders_seq', 10440, false);
