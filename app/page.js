import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="pg-home">
      <div className="announce">
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
