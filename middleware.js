import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifyAdminToken } from '@/lib/admin-session';

// Guards the admin console and every endpoint that edits the shop or reads
// customer data. Before this, /admin and its APIs were completely open — the
// catalogue could be rewritten by anyone who found the URL, and GET /api/orders
// returned every customer's name, phone, email and address.
//
// The rules are method-aware, because path alone gets it wrong in both
// directions:
//   * POST /api/orders is a CUSTOMER placing an order (guarded by its own
//     session check) and must stay open, while GET /api/orders is the admin
//     list of everyone's orders and must not.
//   * GET /api/products backs the public shop grid; POST/PATCH/DELETE on the
//     same path is the admin editing the catalogue.
//
// Anything not matched here is public by default, so a new storefront route
// works without touching this file — but a new admin route must be added, or
// it falls back to the requireAdmin() check inside the handler.

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Paths where every method is admin-only.
const ADMIN_ALL = [/^\/api\/content(\/|$)/, /^\/api\/uploads(\/|$)/];

// Paths where only writes are admin-only; reads stay public.
const ADMIN_WRITES = [
  /^\/api\/products(\/|$)/,
  /^\/api\/categories(\/|$)/,
  /^\/api\/nav-links(\/|$)/,
];

function needsAdmin(pathname, method) {
  // The login page and its endpoints are how you get a session in the first
  // place — guarding them would lock the door with the key inside.
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/')) return false;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;

  if (ADMIN_ALL.some((re) => re.test(pathname))) return true;
  if (ADMIN_WRITES.some((re) => re.test(pathname)) && !READ_METHODS.has(method)) return true;

  // The admin order list. POST is a customer placing an order, so only the
  // read of the full list — and status changes on individual orders — are
  // admin. /api/account/orders is the customer's own and stays public (it
  // checks the customer session itself).
  if (pathname === '/api/orders' && READ_METHODS.has(method)) return true;
  if (/^\/api\/orders\/[^/]+$/.test(pathname) && !READ_METHODS.has(method)) return true;

  return false;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (!needsAdmin(pathname, method)) return NextResponse.next();

  if (await verifyAdminToken(request.cookies.get(COOKIE_NAME)?.value)) {
    return NextResponse.next();
  }

  // API callers get a status they can act on; a browser hitting an admin page
  // gets sent to the login form, with where it was going so it can be resumed.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'not_authorised' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Excludes static assets and image optimisation so the guard doesn't run on
  // every .webp the storefront serves.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|products/|.*\\.webp$|.*\\.png$).*)'],
};
