import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import {
  createSessionRow,
  getCustomerBySessionToken,
  deleteSessionRow,
} from '@/lib/data/customers';

// Customer authentication: password hashing, phone normalisation and the
// session cookie. Deliberately dependency-free — Node's own crypto does
// scrypt, so there's no bcrypt/argon2 native build to keep working, and no
// third-party auth service holding the customer list.
//
// The admin console at /admin/* is a different, still-unprotected surface;
// this file is only about storefront customers.

const COOKIE_NAME = 'ek_session';
// A year. The brief was "when the user opens the site on the same device they
// are always logged in" — anything shorter reintroduces the login friction
// this feature exists to remove. The cookie is httpOnly + sameSite=lax, and
// every session can be revoked server-side by deleting its row.
const SESSION_DAYS = 365;

// --- Passwords ---------------------------------------------------------------

// scrypt with a per-password random salt. Stored as scrypt$<salt>$<key> so the
// scheme is self-describing and can be migrated later without guessing.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [scheme, saltHex, keyHex] = (stored || '').split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  // Constant-time compare — a plain === leaks how much of the hash matched.
  return crypto.timingSafeEqual(actual, expected);
}

// --- Phone numbers -----------------------------------------------------------

// The phone number is the login identifier, so every path that touches one
// (signup, login, linking old orders) has to agree on its shape. Canonical
// form is the local Pakistani format: 11 digits starting 03.
//   "0300 1234567" / "+92 300 1234567" / "00923001234567" -> "03001234567"
// Anything that doesn't fit those patterns is returned digits-only rather than
// rejected, so an unusual number still gets a stable, comparable key.
export function normalizePhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.startsWith('0092')) digits = digits.slice(4);
  else if (digits.startsWith('92') && digits.length === 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('3')) digits = `0${digits}`;
  return digits;
}

export function isValidPhone(phone) {
  return /^0\d{10}$/.test(phone) || /^\d{10,15}$/.test(phone);
}

// --- Sessions ----------------------------------------------------------------

// The cookie holds a random token; the database only ever holds its SHA-256.
// So a database dump can't be replayed as a login, and the app can still look
// a session up in one indexed read.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export async function startSession(customerId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await createSessionRow({ tokenHash: hashToken(token), customerId, expiresAt: expiresAt.toISOString() });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

// Who's asking? Returns the customer for the current request's cookie, or null
// for a signed-out visitor. Safe to call from Server Components and route
// handlers alike.
export async function getSessionCustomer() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await getCustomerBySessionToken(hashToken(token));
  } catch {
    // A database hiccup means "we don't know who this is", not a 500 on a page
    // that renders perfectly well signed out.
    return null;
  }
}

export async function endSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    try {
      await deleteSessionRow(hashToken(token));
    } catch {
      // Even if the row can't be removed, clearing the cookie below logs this
      // browser out — which is what the customer asked for.
    }
  }
  cookies().delete(COOKIE_NAME);
}
