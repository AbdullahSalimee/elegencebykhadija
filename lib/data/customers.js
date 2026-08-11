import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

// Server-only customer + session data access (see supabase/auth.sql).
// Nothing here is cached with unstable_cache: auth state has to be read fresh
// on every request, and a stale session lookup is a security bug, not a slow
// page.

const CUSTOMER_COLUMNS = 'id,phone,name,email,address,created_at';

function mapCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email || null,
    address: row.address || null,
  };
}

export async function getCustomerByPhone(phone) {
  const db = supabaseServer();
  const { data, error } = await db
    .from('customers')
    .select(`${CUSTOMER_COLUMNS},password_hash`)
    .eq('phone', phone)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  // password_hash is kept separate from the mapped shape so it can never be
  // spread into an API response by accident.
  return { customer: mapCustomer(data), passwordHash: data.password_hash };
}

export async function createCustomer({ phone, name, email, address, passwordHash }) {
  const db = supabaseServer();
  const { data, error } = await db
    .from('customers')
    .insert({
      phone,
      name,
      email: email || null,
      address: address || null,
      password_hash: passwordHash,
    })
    .select(CUSTOMER_COLUMNS)
    .single();

  if (error) {
    // 23505 = unique_violation on customers.phone — this number already has an
    // account. Surfaced as a typed error so the API route can answer 409 and
    // the checkout modal can offer "log in instead" rather than a dead end.
    if (error.code === '23505') {
      const err = new Error('phone_taken');
      err.code = 'phone_taken';
      throw err;
    }
    throw error;
  }
  return mapCustomer(data);
}

export async function updateCustomer(id, fields) {
  const db = supabaseServer();
  const { error } = await db.from('customers').update(fields).eq('id', id);
  if (error) throw error;
}

// Claims any past orders placed with this phone number that don't belong to an
// account yet — so signing up surfaces the order you placed five minutes ago.
// Returns how many were adopted.
export async function linkCustomerOrders(customerId, phone) {
  const db = supabaseServer();
  const { data, error } = await db.rpc('link_customer_orders', {
    p_customer: customerId,
    p_phone: phone,
  });
  if (error) throw error;
  return data ?? 0;
}

// --- Sessions ---------------------------------------------------------------

export async function createSessionRow({ tokenHash, customerId, expiresAt }) {
  const db = supabaseServer();
  const { error } = await db.from('customer_sessions').insert({
    token_hash: tokenHash,
    customer_id: customerId,
    expires_at: expiresAt,
  });
  if (error) throw error;
}

// Resolves a session token hash to its customer, or null if the token is
// unknown or expired. Also refreshes last_seen_at, which is what makes the
// session effectively permanent on a device that keeps getting used.
export async function getCustomerBySessionToken(tokenHash) {
  const db = supabaseServer();
  const { data, error } = await db
    .from('customer_sessions')
    .select(`expires_at,customer_id,customers(${CUSTOMER_COLUMNS})`)
    .eq('token_hash', tokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (new Date(data.expires_at) <= new Date()) {
    await deleteSessionRow(tokenHash);
    return null;
  }

  // Fire-and-forget: a failed timestamp refresh must never fail the request
  // that was only trying to read who the customer is.
  db.from('customer_sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .then(() => {}, () => {});

  return mapCustomer(data.customers);
}

export async function deleteSessionRow(tokenHash) {
  const db = supabaseServer();
  const { error } = await db.from('customer_sessions').delete().eq('token_hash', tokenHash);
  if (error) throw error;
}
