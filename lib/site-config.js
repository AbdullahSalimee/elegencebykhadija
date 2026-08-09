// Site config: categories and nav links.
// SWAP for real tables once the backend exists (category, nav_link), same shape.

export const CATEGORIES = [
  { id: "lawn", label: "Lawn" },
  { id: "silk", label: "Silk" },
  { id: "karandi", label: "Karandi" },
];

export const NAV_LINKS = [
  { id: "new-in", label: "New In", href: "/new-in", order: 1 },
  {
    id: "unstitched",
    label: "Unstitched Suits",
    href: "/shop",
    order: 2,
  },
  {
    id: "fabric-guide",
    label: "Fabric Guide",
    href: "/fabric-guide",
    order: 3,
  },
  { id: "sale", label: "Sale", href: "/sale", order: 4 },
  { id: "contact", label: "Contact", href: "/contact", order: 5 },
];

// ---------------------------------------------------------------------------
// Storefront chrome, laid out the way large PK retailers structure a homepage:
// a two-message announcement bar, a utility row above the main header, a
// gender-first mega menu, and a short-column footer.
//
// All of this is content, not layout — swap the strings and the homepage
// re-flows without a component edit.
// ---------------------------------------------------------------------------

export const ANNOUNCEMENTS = [
  "Cash on Delivery available on orders up to Rs. 25,000",
  "Free shipping on all prepaid orders across Pakistan",
];

// Small links that sit above the logo — order tracking and support, kept out
// of the main nav so the category menu stays uncluttered.
export const UTILITY_LINKS = [
  { id: "track", label: "Track Your Order", href: "/contact" },
  { id: "help", label: "Help", href: "/contact" },
  { id: "contact", label: "Contact Us", href: "/contact" },
];

// A `panel` turns the item into a mega menu; without one it is a plain link.
// Every href below resolves to a real route — the shop page filters client
// side, so there are no query-string links that would land on an unfiltered
// grid and look broken.
export const MEGA_NAV = [
  {
    id: "women",
    label: "Women",
    href: "/shop",
    panel: {
      feature: {
        eyebrow: "The Season's Last Sale",
        title: "Up to 50% off unstitched",
        href: "/sale",
      },
      columns: [
        {
          id: "eastern",
          heading: "Eastern",
          links: [
            { label: "View All", href: "/shop" },
            { label: "Unstitched Suits", href: "/shop" },
            { label: "New Arrivals", href: "/new-in" },
            { label: "On Sale", href: "/sale" },
          ],
        },
        {
          id: "fabric",
          heading: "Shop by Fabric",
          links: [
            { label: "Lawn", href: "/shop" },
            { label: "Karandi", href: "/shop" },
            { label: "Silk", href: "/shop" },
            { label: "Fabric Guide", href: "/fabric-guide" },
          ],
        },
        {
          id: "help",
          heading: "Buying Guides",
          links: [
            { label: "How Much Fabric?", href: "/fabric-guide" },
            { label: "Care & Washing", href: "/fabric-guide" },
            { label: "Talk to Us", href: "/contact" },
          ],
        },
      ],
    },
  },
  { id: "new-in", label: "New In", href: "/new-in" },
  { id: "unstitched", label: "Unstitched", href: "/shop" },
  { id: "fabric-guide", label: "Fabric Guide", href: "/fabric-guide" },
  { id: "sale", label: "Sale", href: "/sale", accent: true },
];

// Full-bleed rotating banners. `image` is a file in /public.
export const HERO_SLIDES = [
  {
    id: "sale",
    eyebrow: "The Season's Last Sale",
    title: "Up to 50% Off",
    body: "Lawn, karandi and silk — the last of the season, while the shades last.",
    cta: { label: "Shop the Sale", href: "/sale" },
    image: "/hero1.png",
  },
  {
    id: "new",
    eyebrow: "Just Arrived",
    title: "Unstitched. Unmatched.",
    body: "Three metres of possibility, cut from the finest mills and ready for your tailor.",
    cta: { label: "Shop New In", href: "/new-in" },
    image: "/hero.png",
  },
];

// Image-led category tiles. `image` reuses the product photography already in
// /public/products — swap for dedicated category shots when they are shot.
export const CATEGORY_TILES = [
  { id: "lawn", label: "Lawn", href: "/shop", image: "/products/zarnaab.png" },
  { id: "karandi", label: "Karandi", href: "/shop", image: "/products/anaya.png" },
  { id: "silk", label: "Silk", href: "/shop", image: "/products/rania.png" },
  { id: "new-in", label: "New In", href: "/new-in", image: "/products/meherbano.png" },
  { id: "three-piece", label: "3 Piece", href: "/shop", image: "/products/sana.png" },
  { id: "sale", label: "Sale", href: "/sale", image: "/products/iqra.png" },
];

export const PROMO_BANNERS = [
  {
    id: "fabric",
    eyebrow: "Not sure how much to buy?",
    title: "The Fabric Guide",
    body: "Lawn, karandi and silk compared — weight, season, drape and care.",
    cta: { label: "Read the Guide", href: "/fabric-guide" },
    image: "/products/meherbano.png",
  },
  {
    id: "whatsapp",
    eyebrow: "Order the easy way",
    title: "Buy on WhatsApp",
    body: "Send us a shade and a shirt length. We'll confirm stock and ship it COD.",
    cta: { label: "Start a Chat", href: "/contact" },
    image: "/products/sana.png",
  },
];

export const FOOTER_COLUMNS = [
  {
    id: "company",
    heading: "Company",
    links: [
      { label: "About Us", href: "/contact" },
      { label: "Fabric Guide", href: "/fabric-guide" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    id: "help",
    heading: "Help",
    links: [
      { label: "FAQs", href: "/contact" },
      { label: "Shipping & Returns", href: "/contact" },
      { label: "Track Your Order", href: "/contact" },
      { label: "Size & Fabric Guide", href: "/fabric-guide" },
    ],
  },
  {
    id: "shop",
    heading: "Shop",
    links: [
      { label: "New In", href: "/new-in" },
      { label: "Unstitched Suits", href: "/shop" },
      { label: "Sale", href: "/sale" },
    ],
  },
];

export const REGIONS = ["Pakistan", "United Kingdom", "United States", "UAE", "Rest of World"];
