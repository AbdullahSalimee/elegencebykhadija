'use client';
import { useCart } from '@/lib/cart-context';

export default function Nav() {
  const { cartCount, openCart } = useCart();
  return (
    <nav className="nav">
      <div className="nav-brand">ELEGANCE <span style={{ opacity: .55, fontStyle: 'italic' }}>by Khadija</span></div>
      <a href="#" aria-current="page">New In</a>
      <a href="#">Unstitched Suits</a>
      <a href="#">Fabric Guide</a>
      <a href="#">Sale</a>
      <a href="#">Contact</a>
      <button className="btn btn-icon" aria-label="Search">🔍</button>
      <button className="btn btn-icon" aria-label="Account">👤</button>
      <button className="btn btn-icon" aria-label="Cart" onClick={openCart}>
        👜
        {cartCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: 10, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
