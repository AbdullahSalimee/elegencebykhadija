import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadProductImage } from '@/lib/data/storage';
import { requireAdmin } from '@/lib/admin-auth';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB — generous for a phone photo, rejects anything absurd
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1500; // checklist target: 800x1000–1200x1500 for product images

// POST multipart/form-data { file } — used by the admin product editor.
// Every upload is resized to fit within MAX_WIDTH x MAX_HEIGHT and
// re-encoded as WebP server-side (via sharp) before it ever reaches
// storage, so "upload a multi-megabyte photo" can't happen no matter what
// the admin picks on their end.
export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(buffer)
      .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const url = await uploadProductImage(path, optimized);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}
