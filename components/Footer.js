export default function Footer() {
  return (
    <>
      <div className="footer-cta">
        <div className="footer-cta-eyebrow">Sizing help</div>
        <h2 className="footer-cta-title">Unstitched, one size — paired with any tailor. Not sure how much fabric you need?</h2>
        <button className="btn" style={{ border: '1px solid var(--color-accent-300)', color: 'var(--color-accent-300)', marginTop: 8 }}>View the Size &amp; Fabric Guide</button>
      </div>
      <footer className="site-footer">
        <div>
          <div className="nav-brand" style={{ marginBottom: 10 }}>ELEGANCE <span style={{ opacity: .55, fontStyle: 'italic' }}>by Khadija</span></div>
          <p className="footer-blurb">Unstitched suits for women who tailor their own story — lawn, karandi and silk, shipped across Pakistan.</p>
        </div>
        <div>
          <h6 style={{ marginBottom: 10 }}>Customer Care</h6>
          <div className="footer-col-links">
            <a href="#">FAQs</a><a href="#">Shipping &amp; Returns</a><a href="/track">Track your Order</a><a href="#">Size Guide</a>
          </div>
        </div>
        <div>
          <h6 style={{ marginBottom: 10 }}>Get in Touch</h6>
          <div className="footer-col-links" style={{ opacity: .85 }}>
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
      <div className="hr section-rule" />
      <div className="footer-bottom">© 2026 Elegance by Khadija. All rights reserved.</div>
    </>
  );
}
