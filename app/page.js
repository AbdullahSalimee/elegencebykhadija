import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div>
      <div style={{ background: 'var(--color-neutral-900)', color: '#f3ead9', textAlign: 'center', fontSize: 12, letterSpacing: '.05em', padding: 8 }}>
        Free shipping on orders above Rs. 4,999 · Cash on Delivery available across Pakistan
      </div>
      <Nav />
      <Hero />
      <TrustStrip />
      <ProductGrid />
      <Footer />
    </div>
  );
}
