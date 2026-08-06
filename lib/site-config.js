// Static editorial content — not product/order data, so it stays as hand-written
// constants rather than DB rows. CATEGORIES and NAV_LINKS moved to the database:
// see lib/data/site-config.js (server) and hooks/useSiteConfig.js (client).

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
