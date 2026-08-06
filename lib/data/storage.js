import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

const BUCKET = 'product-images';

// Uploads an already-optimized buffer (see app/api/uploads/product-image,
// which resizes + re-encodes to WebP with sharp before calling this) and
// returns its public CDN URL — matches the *.supabase.co pattern already
// allow-listed in next.config.js's images.remotePatterns.
export async function uploadProductImage(path, buffer) {
  const db = supabaseServer();
  const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (error) throw error;
  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
