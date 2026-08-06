import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client (service role key — never send this to the browser).
// The `server-only` import above makes any accidental client-component import of this
// file a build error rather than a leaked secret.
let cached;

export function supabaseServer() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
        '(see .env.example) after creating your Supabase project and running supabase/migrations/0001_init.sql.'
    );
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
