import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAME, SESSION_HOURS, signAdminToken, verifyAdminToken } from '@/lib/admin-session';

// Admin authentication for /admin and every write endpoint behind it.
//
// One shared password from the environment rather than an admin users table:
// there is a single shop owner, and a table would mean a migration, a user
// management screen and a password reset flow for one row. If a second admin
// is ever needed, this is the file that grows.
//
// The storefront customer login in lib/auth.js is a separate, unrelated
// surface — a signed-in customer is not an admin.

// --- Password ---------------------------------------------------------------

export function verifyAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('Missing ADMIN_PASSWORD — see .env.example. The admin console cannot be used until it is set.');
  }
  const a = Buffer.from(String(password ?? ''));
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, which would itself leak the
  // expected length — so compare a fixed-size digest of each instead.
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// --- Session cookie ---------------------------------------------------------

export async function startAdminSession() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const token = await signAdminToken(expiresAt);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  });
}

export function endAdminSession() {
  cookies().delete(COOKIE_NAME);
}

export async function isAdmin() {
  return verifyAdminToken(cookies().get(COOKIE_NAME)?.value);
}

// --- Route handler guard ----------------------------------------------------
//
// middleware.js already blocks unauthenticated requests to admin endpoints.
// This is the second layer: a route that forgets to appear in the middleware
// matcher, or a future refactor of it, still can't be called anonymously.
// Returns a 401 response to return early, or null when the caller may proceed.
export async function requireAdmin() {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: 'not_authorised' }, { status: 401 });
}
