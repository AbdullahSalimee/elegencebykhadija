// Mock product + variant data.
// SWAP THIS FILE for a real data layer once the backend exists:
//   export async function getProducts() { return db.product.findMany({ include: { variants: true } }); }
// Keep the shape below (id, name, fabric, pieces, price, compareAt, colors[]) so components don't change.

export const PRODUCTS = [
  {
    id: "zarnaab",
    name: "Zarnaab",
    fabric: "Lawn",
    pieces: "3 Piece",
    price: 6200,
    compareAt: 7800,
    arrivedAt: "2026-07-29",
    colors: [
      { id: "emerald", hex: "#3f5d43", label: "Emerald Vine", stock: 12 },
      { id: "rust", hex: "#8a4b3a", label: "Rust", stock: 6 },
      { id: "gold", hex: "#c9a25a", label: "Gold", stock: 0 },
    ],
  },
  {
    id: "rania",
    name: "Rania",
    fabric: "Silk",
    pieces: "3 Piece",
    price: 8900,
    compareAt: null,
    arrivedAt: "2026-07-22",
    colors: [
      { id: "rose", hex: "#7a3b46", label: "Rustic Rose", stock: 8 },
      { id: "ink", hex: "#2e2a3d", label: "Ink", stock: 5 },
      { id: "tan", hex: "#b9895a", label: "Tan", stock: 3 },
    ],
  },
  {
    id: "anaya",
    name: "Anaya",
    fabric: "Karandi",
    pieces: "2 Piece",
    price: 5400,
    compareAt: 6600,
    arrivedAt: "2026-06-30",
    colors: [
      { id: "indigo", hex: "#2f3b57", label: "Indigo Bloom", stock: 15 },
      { id: "olive", hex: "#6b5b3e", label: "Olive", stock: 9 },
      { id: "maroon", hex: "#8f2f3a", label: "Maroon", stock: 2 },
    ],
  },
  {
    id: "meherbano",
    name: "Meherbano",
    fabric: "Lawn",
    pieces: "3 Piece",
    price: 6750,
    compareAt: null,
    arrivedAt: "2026-07-31",
    colors: [
      { id: "saffron", hex: "#c47f2c", label: "Saffron Paisley", stock: 7 },
      { id: "pine", hex: "#41504a", label: "Pine", stock: 11 },
      { id: "brick", hex: "#7a2f2f", label: "Brick", stock: 4 },
    ],
  },
  {
    id: "sana",
    name: "Sana",
    fabric: "Silk",
    pieces: "3 Piece",
    price: 9200,
    compareAt: 11000,
    arrivedAt: "2026-07-10",
    colors: [
      { id: "onyx", hex: "#1f1e22", label: "Onyx Floral", stock: 3 },
      { id: "walnut", hex: "#5c3b2e", label: "Walnut", stock: 6 },
      { id: "brass", hex: "#94793f", label: "Brass", stock: 0 },
    ],
  },
  {
    id: "iqra",
    name: "Iqra",
    fabric: "Lawn",
    pieces: "2 Piece",
    price: 4950,
    compareAt: null,
    arrivedAt: "2026-06-18",
    colors: [
      { id: "blush", hex: "#c98b8f", label: "Blush Botanical", stock: 10 },
      { id: "sage", hex: "#4a5d4f", label: "Sage", stock: 14 },
      { id: "sand", hex: "#d9c19a", label: "Sand", stock: 5 },
    ],
  },
];

export const TRUST_ITEMS = [
  { title: "Cash on Delivery", body: "Pay at your doorstep, no card needed" },
  { title: "WhatsApp Ordering", body: "Chat with us to place your order" },
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
    body: "A fine, plain-weave cotton woven tight enough to hold sharp digital prints without going stiff. It softens with every wash and breathes even on Lahore\u2019s hottest afternoons — the reason it\u2019s the backbone of Pakistani summer dressing.",
  },
  {
    id: "karandi",
    name: "Karandi",
    tagline: "The in-between fabric — cotton\u2019s warmth, silk\u2019s drape",
    texture: "linear-gradient(135deg, #e9e2d3 0%, #d7c8ad 45%, #bfa87f 100%)",
    weight: "Medium weight",
    season: "Early Autumn / Late Winter",
    feel: "Soft matte finish with gentle structure, drapes without clinging",
    care: "Dry clean recommended for embroidered pieces; hand wash plain karandi in cold water.",
    body: "A cotton-wool blend that sits between lawn and full winter wool — enough warmth for October evenings without the bulk. Takes embroidery and block print exceptionally well, which is why it\u2019s a favourite for transitional-season formals.",
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
    body: "Woven for occasion wear — the fabric catches light rather than absorbing it, which is why our silk pieces lean toward richer, jewel-toned palettes. It takes zari and thread work with a durability lawn simply can\u2019t match.",
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}
