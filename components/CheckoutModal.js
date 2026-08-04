'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, cartSubtotal, payMethod, setPayMethod, placeOrder, placing, orderPlaced, orderNumber } = useCart();
  const [contact, setContact] = useState({ name: '', phone: '', address: '' });
  if (!checkoutOpen) return null;

  return (
    <div className="dialog-backdrop" onClick={closeCheckout}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="dialog modal-shell" style={{ width: 'min(480px,92vw)' }}>
          {orderPlaced ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div className="dialog-title" style={{ marginBottom: 8 }}>Order Received</div>
              <div className="dialog-body">Order #EK-{orderNumber} — we'll call to confirm before dispatch. Thank you for shopping with Elegance by Khadija.</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={closeCheckout}>Done</button>
            </div>
          ) : (
            <>
              <div className="dialog-title">Checkout</div>
              <div className="field"><label>Full name</label><input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Khadija Fatima" /></div>
              <div className="field"><label>Phone number</label><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="03XX XXXXXXX" /></div>
              <div className="field"><label>Delivery address</label><textarea className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="House / street, city, postal code" /></div>
              <div className="hr" />
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', opacity: .7, marginBottom: 6 }}>Payment method</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="radio"><input type="radio" name="pay" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} /><span className="dot" /> Cash on Delivery</label>
                <label className="radio"><input type="radio" name="pay" checked={payMethod === 'whatsapp'} onChange={() => setPayMethod('whatsapp')} /><span className="dot" /> WhatsApp Order (we'll confirm details by chat)</label>
                <label className="radio"><input type="radio" name="pay" disabled /><span className="dot" /> JazzCash / Easypaisa <span className="tag tag-neutral" style={{ marginLeft: 6 }}>Coming soon</span></label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 12 }}>
                <span>Total</span><span style={{ fontWeight: 700 }}>Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="dialog-actions">
                <button className="btn btn-secondary" onClick={closeCheckout}>Cancel</button>
                <button className="btn btn-primary" disabled={placing} onClick={() => placeOrder(contact)}>{placing ? 'Placing…' : 'Place Order'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
