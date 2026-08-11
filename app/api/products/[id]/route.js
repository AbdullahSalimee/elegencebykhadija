import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import {
  getProductById,
  updateProductFields,
  updateVariantStock,
  deleteProduct,
} from '@/lib/data/products';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(_request, { params }) {
  try {
    const product = await getProductById(params.id);
    if (!product) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

// PATCH body: { price?, category?, image?, variantStock?: { variantId, stock } }
// Covers all admin edit affordances (price, category, photo, per-colour stock).
export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  try {
    const fields = {};
    if (body.price !== undefined) fields.price = body.price;
    if (body.category !== undefined) fields.category = body.category;
    if (body.image !== undefined) fields.image_url = body.image;
    if (Object.keys(fields).length) await updateProductFields(params.id, fields);
    if (body.variantStock) {
      await updateVariantStock(body.variantStock.variantId, body.variantStock.stock);
    }
    revalidateTag('products');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await deleteProduct(params.id);
    revalidateTag('products');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
