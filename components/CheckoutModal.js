'use client';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useSession, apiSignup, apiLogin } from '@/hooks/useSession';

// Checkout is also the sign-up form. A first-time customer types the details
// they'd have to type anyway — name, phone, address — plus a password, and
// that becomes their account. From then on the session cookie keeps them
// logged in on this device, and every order they place is attached to that
// account so they can follow it from /track without an order number.
//
// If the phone number already has an account, the form flips to a one-field
// "log in and continue" instead of turning them away.
export default function CheckoutModal() {
  const {
    checkoutOpen, closeCheckout, cartSubtotal, payMethod, setPayMethod,
    placeOrder, placing, orderPlaced, orderNumber, orderError, setOrderError,
  } = useCart();
  const { customer, isLoggedIn, isLoading: sessionLoading, mutate: mutateSession } = useSession();

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', password: '' });
  const [mode, setMode] = useState('guest'); // guest | login
  const [authError, setAuthError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Prefill from the account once it's known — a returning customer shouldn't
  // retype the address they used last time.
  useEffect(() => {
    if (customer) {
      setForm((f) => ({
        ...f,
        name: customer.name || f.name,
        phone: customer.phone || f.phone,
        email: customer.email || f.email,
        address: customer.address || f.address,
      }));
    }
  }, [customer]);

  if (!checkoutOpen) return null;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async () => {
    setAuthError(null);
    setOrderError(null);
    setBusy(true);
    try {
      // 1. Make sure we know who this is.
      if (!isLoggedIn) {
        if (mode === 'login') {
          try {
            await apiLogin(form.phone, form.password);
          } catch {
            setAuthError('That password doesn\'t match this number. Try again.');
            return;
          }
        } else {
          try {
            await apiSignup({
              name: form.name,
              phone: form.phone,
              email: form.email,
              address: form.address,
              password: form.password,
            });
          } catch (err) {
            if (err.status === 409) {
              setMode('login');
              setForm((f) => ({ ...f, password: '' }));
              setAuthError('This number already has an account — enter your password to continue.');
            } else if (err.info?.error === 'weak_password') {
              setAuthError('Choose a password of at least 6 characters.');
            } else if (err.info?.error === 'invalid_phone') {
              setAuthError('Enter a valid phone number, e.g. 0300 1234567.');
            } else if (err.info?.error === 'name_required') {
              setAuthError('Please enter your name.');
            } else {
              setAuthError("We couldn't create your account just now. Please try again.");
            }
            return;
          }
        }
        await mutateSession();
      }

      // 2. Place the order against that account.
      await placeOrder(form.address);
    } finally {
      setBusy(false);
    }
  };

  const working = busy || placing;
  const canSubmit = isLoggedIn
    ? form.address.trim().length > 0
    : mode === 'login'
      ? form.phone.trim() && form.password
      : form.name.trim() && form.phone.trim() && form.address.trim() && form.password.length >= 6;

  return (
    <div className="dialog-backdrop" onClick={closeCheckout}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="dialog modal-shell" style={{ width: 'min(480px,92vw)', maxHeight: '90vh', overflow: 'auto' }}>
          {orderPlaced ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div className="dialog-title" style={{ marginBottom: 8 }}>
                Thank you{customer?.name ? `, ${customer.name}` : ''}!
              </div>
              <div className="dialog-body">
                Order #{orderNumber} received — we'll call to confirm before dispatch.
                {customer?.email && ' A confirmation has been sent to your email.'}
              </div>
              <a href="/track" className="btn btn-secondary" style={{ marginTop: 16, marginRight: 8 }}>
                My orders
              </a>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={closeCheckout}>Done</button>
            </div>
          ) : (
            <>
              <div className="dialog-title">Checkout</div>

              {sessionLoading ? (
                <div className="dialog-body" style={{ opacity: .7 }}>Loading…</div>
              ) : isLoggedIn ? (
                <div className="panel" style={{ padding: '10px 12px', marginBottom: 4 }}>
                  <div style={{ fontSize: 13.5 }}>Ordering as <strong>{customer.name}</strong></div>
                  <div className="card-meta">{customer.phone}{customer.email ? ` · ${customer.email}` : ''}</div>
                </div>
              ) : mode === 'login' ? (
                <>
                  <div className="dialog-body" style={{ fontSize: 13.5, opacity: .8 }}>
                    Welcome back — log in to place this order.
                  </div>
                  <div className="field"><label>Phone number</label><input className="input" value={form.phone} onChange={set('phone')} placeholder="03XX XXXXXXX" /></div>
                  <div className="field"><label>Password</label><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Your password" /></div>
                  <button className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => { setMode('guest'); setAuthError(null); }}>
                    Use a different number
                  </button>
                </>
              ) : (
                <>
                  <div className="field"><label>Full name</label><input className="input" value={form.name} onChange={set('name')} placeholder="Khadija Fatima" /></div>
                  <div className="field"><label>Phone number</label><input className="input" value={form.phone} onChange={set('phone')} placeholder="03XX XXXXXXX" /></div>
                  <div className="field"><label>Email (optional — for order updates)</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
                  <div className="field">
                    <label>Create a password</label>
                    <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
                    <div style={{ fontSize: 11.5, opacity: .65, marginTop: 4 }}>
                      Your phone number and this password let you follow every order you place with us.
                    </div>
                  </div>
                </>
              )}

              {(mode !== 'login' || isLoggedIn) && (
                <div className="field"><label>Delivery address</label><textarea className="input" value={form.address} onChange={set('address')} placeholder="House / street, city, postal code" /></div>
              )}

              <div className="hr" />
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', opacity: .7, marginBottom: 6 }}>Payment method</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="radio"><input type="radio" name="pay" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} /><span className="dot" /> Cash on Delivery</label>
                <label className="radio"><input type="radio" name="pay" checked={payMethod === 'jazzcash'} onChange={() => setPayMethod('jazzcash')} /><span className="dot" /> JazzCash</label>
                <label className="radio"><input type="radio" name="pay" checked={payMethod === 'easypaisa'} onChange={() => setPayMethod('easypaisa')} /><span className="dot" /> Easypaisa</label>
              </div>
              {payMethod !== 'cod' && (
                <div style={{ fontSize: 11.5, opacity: .65, marginTop: 6 }}>
                  We'll share the transfer details when we call to confirm your order.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 12 }}>
                <span>Total</span><span style={{ fontWeight: 700 }}>Rs. {cartSubtotal.toLocaleString()}</span>
              </div>

              {(authError || orderError) && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#8f2f3a' }}>{authError || orderError}</div>
              )}

              <div className="dialog-actions">
                <button className="btn btn-secondary" onClick={closeCheckout}>Cancel</button>
                <button className="btn btn-primary" disabled={working || !canSubmit} onClick={submit}>
                  {working ? 'Placing…' : mode === 'login' && !isLoggedIn ? 'Log in & place order' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
