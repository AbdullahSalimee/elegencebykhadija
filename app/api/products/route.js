import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/data/products';
import { revalidateTag } from 'next/cache';

// GET /api/products?category=lawn,silk&fabric=Lawn&pieces=2%20Piece&maxPrice=8000
//     &onSale=1&inStock=1&sort=newest&page=1&pageSize=24
// Backs the client-side hooks (useProducts) — Server Components should call
// lib/data/products.js directly instead of hitting this over the network.

function parseList(param) {
  if (!param) return undefined;
  return param.split(',').filter(Boolean);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const maxPriceRaw = searchParams.get('maxPrice');

  const filters = {
    category: parseList(searchParams.get('category')),
    fabric: parseList(searchParams.get('fabric')),
    pieces: parseList(searchParams.get('pieces')),
    maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
    onSale: searchParams.get('onSale') === '1',
    inStock: searchParams.get('inStock') === '1',
    q: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page') || 1),
    pageSize: Number(searchParams.get('pageSize') || 24),
  };

  try {
    const { products, total } = await getProducts(filters);
    return NextResponse.json({ products, total });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

// POST — admin "Add Product" (app/admin/products/page.js)
export async function POST(request) {
  const body = await request.json();
  if (!body?.id || !body?.name) {
    return NextResponse.json({ error: 'invalid_product' }, { status: 400 });
  }
  try {
    await createProduct(body);
    revalidateTag('products');
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
