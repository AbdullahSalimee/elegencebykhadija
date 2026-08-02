export default function Footer() {
  return (
    <>
      <div style={{ background: 'var(--color-neutral-900)', color: '#efe9df', padding: '64px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent-300)', marginBottom: 10 }}>Sizing help</div>
        <h2 style={{ fontSize: 30, color: '#efe9df', maxWidth: '26ch', margin: '0 auto 12px' }}>Unstitched, one size — paired with any tailor. Not sure how much fabric you need?</h2>
        <button className="btn" style={{ border: '1px solid var(--color-accent-300)', color: 'var(--color-accent-300)', marginTop: 8 }}>View the Size &amp; Fabric Guide</button>
      </div>
      <footer style={{ padding: 48, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: 32 }}>
        <div>
          <div className="nav-brand" style={{ marginBottom: 10 }}>ELEGANCE <span style={{ opacity: .55, fontStyle: 'italic' }}>by Khadija</span></div>
          <p style={{ fontSize: 13, maxWidth: '32ch', opacity: .75 }}>Unstitched suits for women who tailor their own story — lawn, karandi and silk, shipped across Pakistan.</p>
        </div>
        <div>
          <h6 style={{ marginBottom: 10 }}>Customer Care</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <a href="#">FAQs</a><a href="#">Shipping &amp; Returns</a><a href="#">Track your Order</a><a href="#">Size Guide</a>
          </div>
        </div>
        <div>
          <h6 style={{ marginBottom: 10 }}>Get in Touch</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, opacity: .85 }}>
            <span>WhatsApp: +92 300 1234567</span>
            <span>hello@elegancebykhadija.pk</span>
            <span>Lahore, Pakistan</span>
          </div>
        </div>
        <div>
          <h6 style={{ marginBottom: 10 }}>Stay in the Loop</h6>
          <div className="field"><input className="input" placeholder="Your email" /></div>
          <button className="btn btn-primary btn-block">Subscribe</button>
        </div>
      </footer>
      <div className="hr" style={{ margin: '0 48px' }} />
      <div style={{ padding: '20px 48px 40px', fontSize: 12, opacity: .6 }}>© 2026 Elegance by Khadija. All rights reserved.</div>
    </>
  );
}
