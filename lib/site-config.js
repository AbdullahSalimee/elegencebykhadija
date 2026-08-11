// Static editorial content — not product/order data, so it stays as hand-written
// constants rather than DB rows. CATEGORIES and NAV_LINKS moved to the database:
// see lib/data/site-config.js (server) and hooks/useSiteConfig.js (client).

export const TRUST_ITEMS = [
  { title: "Cash on Delivery", body: "Pay at your doorstep, no card needed" },
  { title: "Track Every Order", body: "Follow it from your account, start to finish" },
  { title: "Pakistan-wide Delivery", body: "3–7 business days, tracked" },
  { title: "Easy Exchanges", body: "Wrong shade or size? We'll sort it" },
];

// Fabric reference used by the Fabric Guide page. Purely editorial content —
// not tied to individual product rows, but keyed the same way as `fabric` above.
export const FABRIC_GUIDE = [
  {
    id: "lawn",
    name: "Lawn",
    tagline: "Light as the first warm week of spring",
    texture: "linear-gradient(135deg, #eef0e6 0%, #dfe3d2 45%, #cfd6bd 100%)",
    weight: "Lightweight",
    season: "Spring / Summer",
    feel: "Crisp, breathable, holds print and colour beautifully",
    care: "Hand wash or gentle machine cycle, cool water. Iron on medium heat.",
    body: "A fine, plain-weave cotton woven tight enough to hold sharp digital prints without going stiff. It softens with every wash and breathes even on Lahore’s hottest afternoons — the reason it’s the backbone of Pakistani summer dressing.",
  },
  {
    id: "karandi",
    name: "Karandi",
    tagline: "The in-between fabric — cotton’s warmth, silk’s drape",
    texture: "linear-gradient(135deg, #e9e2d3 0%, #d7c8ad 45%, #bfa87f 100%)",
    weight: "Medium weight",
    season: "Early Autumn / Late Winter",
    feel: "Soft matte finish with gentle structure, drapes without clinging",
    care: "Dry clean recommended for embroidered pieces; hand wash plain karandi in cold water.",
    body: "A cotton-wool blend that sits between lawn and full winter wool — enough warmth for October evenings without the bulk. Takes embroidery and block print exceptionally well, which is why it’s a favourite for transitional-season formals.",
  },
  {
    id: "silk",
    name: "Silk",
    tagline: "For the pieces that are meant to be remembered",
    texture: "linear-gradient(135deg, #efe2df 0%, #d8b8ae 45%, #b98577 100%)",
    weight: "Fluid, medium weight",
    season: "Festive / Formal, year-round",
    feel: "Smooth, lustrous, falls in soft folds with a natural sheen",
    care: "Dry clean only. Store folded in muslin, away from direct light.",
    body: "Woven for occasion wear — the fabric catches light rather than absorbing it, which is why our silk pieces lean toward richer, jewel-toned palettes. It takes zari and thread work with a durability lawn simply can’t match.",
  },
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

// Full-bleed rotating banners. Both files live in /public: `image` is the
// landscape crop for desktop, `mobileImage` the portrait one for phones.
// These are genuinely different photographs, not the same frame resized —
// a landscape shot squeezed into a phone leaves the model tiny and puts her
// face behind the header.
export const HERO_SLIDES = [
  {
    id: "sale",
    eyebrow: "The Season's Last Sale",
    title: "Up to 50% Off",
    body: "Lawn, karandi and silk — the last of the season, while the shades last.",
    cta: { label: "Shop the Sale", href: "/sale" },
    image: "/hero1.webp",
    mobileImage: "/mobilehero1.webp",
  },
  {
    id: "new",
    eyebrow: "Just Arrived",
    title: "Unstitched. Unmatched.",
    body: "Three metres of possibility, cut from the finest mills and ready for your tailor.",
    cta: { label: "Shop New In", href: "/new-in" },
    image: "/hero.webp",
    mobileImage: "/mobilehero.webp",
  },
];

// Image-led category tiles. `image` reuses the product photography already in
// /public/products — swap for dedicated category shots when they are shot.
export const CATEGORY_TILES = [
  { id: "lawn", label: "Lawn", href: "/shop", image: "/products/zarnaab.webp" },
  { id: "karandi", label: "Karandi", href: "/shop", image: "/products/anaya.webp" },
  { id: "silk", label: "Silk", href: "/shop", image: "/products/rania.webp" },
  { id: "new-in", label: "New In", href: "/new-in", image: "/products/meherbano.webp" },
  { id: "three-piece", label: "3 Piece", href: "/shop", image: "/products/sana.webp" },
  { id: "sale", label: "Sale", href: "/sale", image: "/products/iqra.webp" },
];

// Full-width collection blocks: a centred heading over a tall photograph
// with a caption plate straddling the image's bottom edge.
//
// One block per suit, so the homepage runs the full catalogue top to bottom.
// The homepage maps over this array — add or remove an entry and the page
// grows or shrinks with it, no component edit.
export const COLLECTION_BLOCKS = [
  {
    id: "zarnaab",
    heading: "Pret",
    caption: "Zarnaab — Lawn SS26 Vol-II",
    href: "/shop",
    image: "/products/zarnaab.webp",
  },
  {
    id: "rania",
    heading: "Luxury Pret",
    caption: "Rania — Silk Festive 26",
    href: "/shop",
    image: "/products/rania.webp",
  },
  {
    id: "anaya",
    heading: "Everyday Karandi",
    caption: "Anaya — Karandi Vol-I",
    href: "/shop",
    image: "/products/anaya.webp",
  },
  {
    id: "meherbano",
    heading: "Summer Lawn",
    caption: "Meherbano — Lawn Vol-II",
    href: "/shop",
    image: "/products/meherbano.webp",
  },
  {
    id: "sana",
    heading: "Occasion Silk",
    caption: "Sana — Silk Noir",
    href: "/shop",
    image: "/products/sana.webp",
  },
  {
    id: "iqra",
    heading: "The Daily Edit",
    caption: "Iqra — Lawn Essentials",
    href: "/shop",
    image: "/products/iqra.webp",
  },
];

export const PROMO_BANNERS = [
  {
    id: "fabric",
    eyebrow: "Not sure how much to buy?",
    title: "The Fabric Guide",
    body: "Lawn, karandi and silk compared — weight, season, drape and care.",
    cta: { label: "Read the Guide", href: "/fabric-guide" },
    image: "/products/meherbano.webp",
  },
  {
    id: "whatsapp",
    eyebrow: "Order the easy way",
    title: "Buy on WhatsApp",
    body: "Send us a shade and a shirt length. We'll confirm stock and ship it COD.",
    cta: { label: "Start a Chat", href: "/contact" },
    image: "/products/sana.webp",
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
      { label: "Track Your Order", href: "/track" },
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
