// Admin session token: sign and verify, using Web Crypto only.
//
// Deliberately NOT `server-only` and deliberately not node:crypto — middleware.js
// runs on the Edge runtime, where node:crypto isn't available, and it needs to
// verify the same token the Node route handlers issue. Web Crypto exists in
// both, so this one module serves both sides.
//
// The token is stateless: `<base64url(payload)>.<base64url(hmac)>`, where the
// payload carries only an expiry. There's one shop owner, so a sessions table
// would add a migration and a round trip per request to hold a single row.
// Revocation is by rotating ADMIN_SESSION_SECRET, which invalidates every
// issued token at once.

const COOKIE_NAME = 'ek_admin';
// Short by storefront standards on purpose: this cookie edits the catalogue and
// reads every customer's contact details, and the owner works in sessions
// rather than leaving it open for a year like the customer cookie.
const SESSION_HOURS = 12;

export { COOKIE_NAME, SESSION_HOURS };

function secretBytes() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'Missing or too-short ADMIN_SESSION_SECRET (min 16 chars) — see .env.example. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return new TextEncoder().encode(secret);
}

async function hmacKey(usages) {
  return crypto.subtle.importKey(
    'raw',
    secretBytes(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages
  );
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function signAdminToken(expiresAtMs) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp: expiresAtMs })));
  const key = await hmacKey(['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

// Returns true only for a token this secret signed that hasn't expired.
// Every failure path returns false rather than throwing — a malformed cookie is
// a signed-out visitor, not a 500.
export async function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  try {
    const key = await hmacKey(['verify']);
    // crypto.subtle.verify is constant-time, so this doesn't leak how much of
    // the signature matched the way a string compare would.
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;

    const { exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}
