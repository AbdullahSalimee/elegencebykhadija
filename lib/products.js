// Mock product + variant data.
// SWAP THIS FILE for a real data layer once the backend exists:
//   export async function getProducts() { return db.product.findMany({ include: { variants: true } }); }
// Keep the shape below (id, name, fabric, pieces, price, compareAt, colors[]) so components don't change.

export const PRODUCTS = [
  { id: 'zarnaab', name: 'Zarnaab', fabric: 'Lawn', pieces: '3 Piece', price: 6200, compareAt: 7800,
    colors: [{ id: 'emerald', hex: '#3f5d43', label: 'Emerald Vine', stock: 12 }, { id: 'rust', hex: '#8a4b3a', label: 'Rust', stock: 6 }, { id: 'gold', hex: '#c9a25a', label: 'Gold', stock: 0 }] },
  { id: 'rania', name: 'Rania', fabric: 'Silk', pieces: '3 Piece', price: 8900, compareAt: null,
    colors: [{ id: 'rose', hex: '#7a3b46', label: 'Rustic Rose', stock: 8 }, { id: 'ink', hex: '#2e2a3d', label: 'Ink', stock: 5 }, { id: 'tan', hex: '#b9895a', label: 'Tan', stock: 3 }] },
  { id: 'anaya', name: 'Anaya', fabric: 'Karandi', pieces: '2 Piece', price: 5400, compareAt: 6600,
    colors: [{ id: 'indigo', hex: '#2f3b57', label: 'Indigo Bloom', stock: 15 }, { id: 'olive', hex: '#6b5b3e', label: 'Olive', stock: 9 }, { id: 'maroon', hex: '#8f2f3a', label: 'Maroon', stock: 2 }] },
  { id: 'meherbano', name: 'Meherbano', fabric: 'Lawn', pieces: '3 Piece', price: 6750, compareAt: null,
    colors: [{ id: 'saffron', hex: '#c47f2c', label: 'Saffron Paisley', stock: 7 }, { id: 'pine', hex: '#41504a', label: 'Pine', stock: 11 }, { id: 'brick', hex: '#7a2f2f', label: 'Brick', stock: 4 }] },
  { id: 'sana', name: 'Sana', fabric: 'Silk', pieces: '3 Piece', price: 9200, compareAt: 11000,
    colors: [{ id: 'onyx', hex: '#1f1e22', label: 'Onyx Floral', stock: 3 }, { id: 'walnut', hex: '#5c3b2e', label: 'Walnut', stock: 6 }, { id: 'brass', hex: '#94793f', label: 'Brass', stock: 0 }] },
  { id: 'iqra', name: 'Iqra', fabric: 'Lawn', pieces: '2 Piece', price: 4950, compareAt: null,
    colors: [{ id: 'blush', hex: '#c98b8f', label: 'Blush Botanical', stock: 10 }, { id: 'sage', hex: '#4a5d4f', label: 'Sage', stock: 14 }, { id: 'sand', hex: '#d9c19a', label: 'Sand', stock: 5 }] }
];

export const TRUST_ITEMS = [
  { title: 'Cash on Delivery', body: 'Pay at your doorstep, no card needed' },
  { title: 'WhatsApp Ordering', body: 'Chat with us to place your order' },
  { title: 'Pakistan-wide Delivery', body: '3–7 business days, tracked' },
  { title: 'Easy Exchanges', body: "Wrong shade or size? We'll sort it" }
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}
